package com.clinic.visit_service.service.impl;

import com.clinic.visit_service.dto.*;
import com.clinic.visit_service.dto.external.AppointmentDTO;
import com.clinic.visit_service.entity.Prescription;
import com.clinic.visit_service.entity.Visit;
import com.clinic.visit_service.exception.RecordAlreadySignedException;
import com.clinic.visit_service.exception.ResourceNotFoundException;
import com.clinic.visit_service.mapper.PrescriptionMapper;
import com.clinic.visit_service.mapper.VisitMapper;
import com.clinic.visit_service.repository.PrescriptionRepository;
import com.clinic.visit_service.repository.VisitRepository;
import com.clinic.visit_service.service.VisitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitServiceImpl implements VisitService {

    private final VisitRepository visitRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VisitMapper visitMapper;
    private final PrescriptionMapper prescriptionMapper;
    private final RestTemplate restTemplate;

    @Value("${services.appointment.url}")
    private String appointmentServiceUrl;

    @Value("${services.billing.url}")
    private String billingServiceUrl;

    @Override
    @Transactional
    public VisitResponse createVisit(VisitRequest request) {
        log.info("Creating visit for appointment: {}", request.getAppointmentId());

        // Validate appointment and get details
        AppointmentDTO appointment = fetchAppointmentDetails(request.getAppointmentId());

        Visit visit = Visit.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .chiefComplaint(request.getChiefComplaint())
                .examinationFindings(request.getExaminationFindings())
                .assessment(request.getAssessment())
                .plan(request.getPlan())
                .icd10Codes(request.getIcd10Codes())
                .isSigned(false)
                .version(1)
                .build();

        Visit savedVisit = visitRepository.save(visit);
        return visitMapper.toResponse(savedVisit);
    }

    @Override
    public VisitResponse getVisitById(UUID id) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        return visitMapper.toResponse(visit);
    }

    @Override
    public Page<VisitResponse> getAllVisits(UUID patientId, UUID doctorId, LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        Specification<Visit> spec = Specification.where(null);

        if (patientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("patientId"), patientId));
        }
        if (doctorId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("doctorId"), doctorId));
        }
        // Adding date filters would require joining with appointment or having visit date field.
        // For simplicity, let's assume we filter by createdAt if no visit date.

        return visitRepository.findAll(spec, pageable).map(visitMapper::toResponse);
    }

    @Override
    @Transactional
    public VisitResponse updateVisit(UUID id, VisitRequest request) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        if (Boolean.TRUE.equals(visit.getIsSigned())) {
            throw new RecordAlreadySignedException("Cannot update a signed visit record");
        }

        visitMapper.updateEntity(request, visit);
        Visit updatedVisit = visitRepository.save(visit);
        return visitMapper.toResponse(updatedVisit);
    }

    @Override
    @Transactional
    public VisitResponse signVisit(UUID id, SignVisitRequest request) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        if (Boolean.TRUE.equals(visit.getIsSigned())) {
            return visitMapper.toResponse(visit);
        }

        // 1. Fetch appointment details to get the price (consultation fee)
        AppointmentDTO appointment = fetchAppointmentDetails(visit.getAppointmentId());

        // 2. Prepare Invoice Request for Billing Service
        java.util.List<java.util.Map<String, Object>> lineItems = new java.util.ArrayList<>();
        
        // Add Consultation Fee (from Appointment Price)
        lineItems.add(java.util.Map.of(
            "description", "Consultation Fee",
            "quantity", 1,
            "unitPrice", appointment.getPrice() != null ? appointment.getPrice() : 0.0
        ));

        // Add additional items from request if any
        if (request != null && request.getAdditionalItems() != null) {
            for (LineItemRequest item : request.getAdditionalItems()) {
                lineItems.add(java.util.Map.of(
                    "description", item.getDescription(),
                    "quantity", item.getQuantity(),
                    "unitPrice", item.getUnitPrice()
                ));
            }
        }

        // 3. Create Invoice in Billing Service
        java.util.Map<String, Object> invoiceRequest = new java.util.HashMap<>();
        invoiceRequest.put("visitId", visit.getId());
        invoiceRequest.put("patientId", visit.getPatientId());
        invoiceRequest.put("appointmentId", visit.getAppointmentId());
        invoiceRequest.put("lineItems", lineItems);

        try {
            log.info("Creating invoice for visit {} via Billing Service", visit.getId());
            restTemplate.postForEntity(billingServiceUrl, invoiceRequest, Object.class);
        } catch (Exception e) {
            log.error("Failed to create invoice: {}", e.getMessage());
            // Depending on business rules, you might want to fail the sign action or continue.
            // For now, let's assume invoice creation is required.
            throw new RuntimeException("Billing Service error: " + e.getMessage());
        }

        // 4. Mark visit as signed
        visit.setIsSigned(true);
        visit.setSignedAt(LocalDateTime.now());
        Visit savedVisit = visitRepository.save(visit);
        return visitMapper.toResponse(savedVisit);
    }

    @Override
    @Transactional
    public VisitResponse amendVisit(UUID id, VisitRequest request) {
        Visit originalVisit = visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Original visit not found"));

        if (!Boolean.TRUE.equals(originalVisit.getIsSigned())) {
            throw new IllegalStateException("Can only amend signed visits. Use PUT for unsigned visits.");
        }

        Visit amendedVisit = Visit.builder()
                .appointmentId(originalVisit.getAppointmentId())
                .patientId(originalVisit.getPatientId())
                .doctorId(originalVisit.getDoctorId())
                .chiefComplaint(request.getChiefComplaint())
                .examinationFindings(request.getExaminationFindings())
                .assessment(request.getAssessment())
                .plan(request.getPlan())
                .icd10Codes(request.getIcd10Codes())
                .isSigned(false)
                .version(originalVisit.getVersion() + 1)
                .parentRecordId(originalVisit.getId())
                .build();

        Visit savedVisit = visitRepository.save(amendedVisit);
        return visitMapper.toResponse(savedVisit);
    }

    @Override
    @Transactional
    public PrescriptionResponse issuePrescription(UUID visitId, PrescriptionRequest request) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        Prescription prescription = Prescription.builder()
                .visit(visit)
                .patientId(visit.getPatientId())
                .medicationName(request.getMedicationName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .durationDays(request.getDurationDays())
                .notes(request.getNotes())
                .build();

        // Placeholder for PDF generation and S3 upload
        prescription.setPdfKey("prescriptions/" + UUID.randomUUID() + ".pdf");

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        PrescriptionResponse response = prescriptionMapper.toResponse(savedPrescription);
        response.setPdfDownloadUrl("https://dummy-s3-url.com/" + prescription.getPdfKey());
        
        return response;
    }

    @Override
    @Transactional
    public FollowUpResponse scheduleFollowUp(UUID visitId, FollowUpRequest request) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        // Call Appointment Service to create follow-up
        // Request body for Appointment Service would typically include patientId, doctorId, slot info
        log.info("Scheduling follow-up for patient {} with doctor {}", visit.getPatientId(), visit.getDoctorId());
        
        // This is a placeholder for the actual rest call
        // In a real scenario, you'd POST to /appointments
        
        return FollowUpResponse.builder()
                .followUpId(UUID.randomUUID())
                .appointmentId(UUID.randomUUID())
                .sourceVisitId(visit.getId())
                .slotDate(request.getSlotDate())
                .status("CONFIRMED")
                .build();
    }

    @Override
    public java.util.List<LineItemRequest> getBillingOptions() {
        return java.util.List.of(
            new LineItemRequest("X-Ray - Chest", 1, java.math.BigDecimal.valueOf(50.0)),
            new LineItemRequest("Blood Test - CBC", 1, java.math.BigDecimal.valueOf(25.0)),
            new LineItemRequest("Injection - Intramuscular", 1, java.math.BigDecimal.valueOf(15.0)),
            new LineItemRequest("Wound Dressing", 1, java.math.BigDecimal.valueOf(20.0)),
            new LineItemRequest("Nebulization", 1, java.math.BigDecimal.valueOf(30.0)),
            new LineItemRequest("ECG", 1, java.math.BigDecimal.valueOf(40.0))
        );
    }

    private AppointmentDTO fetchAppointmentDetails(UUID appointmentId) {
        String url = appointmentServiceUrl + "/" + appointmentId;
        try {
            ResponseEntity<AppointmentDTO> response = restTemplate.getForEntity(url, AppointmentDTO.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new ResourceNotFoundException("Appointment details not found from external service");
            }
        } catch (Exception e) {
            log.error("Error fetching appointment details: {}", e.getMessage());
            throw new RuntimeException("Could not connect to Appointment Service");
        }
    }
}
