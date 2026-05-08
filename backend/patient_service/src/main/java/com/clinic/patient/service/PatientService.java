package com.clinic.patient.service;

import com.clinic.patient.dto.*;
import com.clinic.patient.entity.Patient;
import com.clinic.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository repo;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${services.visit.url}")
    private String visitServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${services.billing.url}")
    private String billingServiceUrl;

    public PatientResponse create(PatientRequest req) {
        Patient p = new Patient();
        updatePatientFromRequest(p, req);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        repo.save(p);
        return mapToResponse(p);
    }

    public PatientResponse getById(UUID id) {
        Patient p = repo.findById(id).orElseThrow(() -> new RuntimeException("Patient Not Found"));
        return mapToResponse(p);
    }

    public PatientResponse getByUserId(UUID userId) {
        Patient p = repo.findByUserId(userId).orElseThrow(() -> new RuntimeException("Patient Not Found for this user"));
        return mapToResponse(p);
    }

    public PatientResponse update(UUID id, PatientRequest req) {
        Patient p = repo.findById(id).orElseThrow(() -> new RuntimeException("Patient Not Found"));
        updatePatientFromRequest(p, req);
        p.setUpdatedAt(LocalDateTime.now());
        repo.save(p);
        return mapToResponse(p);
    }

    public Page<PatientResponse> getAll(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Patient> patients;
        if (query != null && !query.isEmpty()) {
            patients = repo.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrPhoneContaining(
                query, query, query, pageable);
        } else {
            patients = repo.findAll(pageable);
        }
        return patients.map(this::mapToResponse);
    }

    private void updatePatientFromRequest(Patient p, PatientRequest req) {
        if (req.getUserId() != null) p.setUserId(req.getUserId());
        if (req.getFirstName() != null) p.setFirstName(req.getFirstName());
        if (req.getLastName() != null) p.setLastName(req.getLastName());
        if (req.getDateOfBirth() != null) p.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender() != null) p.setGender(req.getGender());
        if (req.getPhone() != null) p.setPhone(req.getPhone());
        if (req.getAddress() != null) p.setAddress(req.getAddress());
        if (req.getBloodType() != null) p.setBloodType(req.getBloodType());
        if (req.getKnownAllergies() != null) p.setKnownAllergies(req.getKnownAllergies());
        if (req.getEmergencyContact() != null) p.setEmergencyContact(req.getEmergencyContact());
        if (req.getEmergencyPhone() != null) p.setEmergencyPhone(req.getEmergencyPhone());
        if (req.getInsuranceProvider() != null) p.setInsuranceProvider(req.getInsuranceProvider());
        if (req.getInsuranceNumber() != null) p.setInsuranceNumber(req.getInsuranceNumber());
    }

    private PatientResponse mapToResponse(Patient p) {
        return PatientResponse.builder()
            .id(p.getId())
            .firstName(p.getFirstName())
            .lastName(p.getLastName())
            .dateOfBirth(p.getDateOfBirth())
            .gender(p.getGender())
            .phone(p.getPhone())
            .address(p.getAddress())
            .bloodType(p.getBloodType())
            .knownAllergies(p.getKnownAllergies())
            .emergencyContact(p.getEmergencyContact())
            .emergencyPhone(p.getEmergencyPhone())
            .insuranceProvider(p.getInsuranceProvider())
            .insuranceNumber(p.getInsuranceNumber())
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }

    public Object getVisitsForPatient(UUID patientId) {
        String url = visitServiceUrl + "?patientId=" + patientId;
        return restTemplate.getForObject(url, Object.class);
    }

    public Object getInvoicesForPatient(UUID patientId) {
        String url = billingServiceUrl + "?patientId=" + patientId;
        return restTemplate.getForObject(url, Object.class);
    }
}
