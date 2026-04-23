package com.clinic.appointment_service.service.impl;

import com.clinic.appointment_service.dto.*;
import com.clinic.appointment_service.entity.Appointment;
import com.clinic.appointment_service.entity.AppointmentStatus;
import com.clinic.appointment_service.entity.Waitlist;
import com.clinic.appointment_service.exception.ConflictException;
import com.clinic.appointment_service.exception.ResourceNotFoundException;
import com.clinic.appointment_service.exception.ValidationException;
import com.clinic.appointment_service.mapper.AppointmentMapper;
import com.clinic.appointment_service.repository.AppointmentRepository;
import com.clinic.appointment_service.repository.WaitlistRepository;
import com.clinic.appointment_service.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final WaitlistRepository waitlistRepository;
    private final AppointmentMapper appointmentMapper;
    private final RestTemplate restTemplate;

    @Value("${services.doctor.url}")
    private String doctorServiceUrl;

    @Value("${services.patient.url}")
    private String patientServiceUrl;

    @Override
    @Transactional
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request, UUID bookedBy) {

        // 0. Validate logical time order
        if (!request.getSlotStart().isBefore(request.getSlotEnd())) {
            throw new ValidationException("Slot start time must be before end time.");
        }

        log.debug("Booking attempt: Doctor {}, Date {}, Slot {} - {}", 
            request.getDoctorId(), request.getSlotDate(), request.getSlotStart(), request.getSlotEnd());

        // 1. Check if Doctor exists in Doctor Service
        try {
            restTemplate.getForObject(doctorServiceUrl + "/" + request.getDoctorId(), Object.class);
        } catch (Exception e) {
            log.error("Doctor Service error: {}", e.getMessage());
            throw new ResourceNotFoundException("Doctor not found in Doctor Service.");
        }

        // 1.1 Check if Patient exists in Patient Service
        try {
            restTemplate.getForObject(patientServiceUrl + "/" + request.getPatientId(), Object.class);
        } catch (Exception e) {
            log.error("Patient Service error: {}", e.getMessage());
            throw new ResourceNotFoundException("Patient not found in Patient Service.");
        }

        // 2. Check if the slot is actually available in Doctor Service
        String slotsUrl = doctorServiceUrl + "/" + request.getDoctorId() + "/slots?date=" + request.getSlotDate();
        try {
            com.clinic.appointment_service.dto.external.AvailabilityResponseDTO availability = restTemplate
                    .getForObject(slotsUrl, com.clinic.appointment_service.dto.external.AvailabilityResponseDTO.class);

            // The Doctor service returns slots with format HH:mm:ss (e.g. 10:00:00)
            String requestedStart = request.getSlotStart().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
            String requestedEnd = request.getSlotEnd().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));

            // Find the matching slot to get the price
            com.clinic.appointment_service.dto.external.AvailabilityResponseDTO.SlotDTO matchedSlot = availability.getSlots().stream()
                    .filter(slot -> 
                        (slot.getStart().startsWith(requestedStart)) && 
                        (slot.getEnd().startsWith(requestedEnd)) && 
                        slot.isAvailable())
                    .findFirst()
                    .orElse(null);

            if (matchedSlot == null) {
                throw new ValidationException("The requested slot " + requestedStart + "-" + requestedEnd + " is not available in the doctor's schedule.");
            }

            Appointment appointment = appointmentMapper.toEntity(request);
            appointment.setStatus(AppointmentStatus.REQUESTED);
            appointment.setBookedBy(bookedBy);
            appointment.setPrice(matchedSlot.getPrice()); // Capture and store the price at booking time

            // 3. Check if slot is already booked in our Appointment Database
            if (appointmentRepository.existsByDoctorIdAndSlotDateAndSlotStart(
                    request.getDoctorId(), request.getSlotDate(), request.getSlotStart())) {
                throw new ConflictException("This slot is already booked.");
            }

            // 4. Check if patient has any other overlapping appointment on this day
            if (appointmentRepository.existsOverlappingAppointment(
                    request.getPatientId(), request.getSlotDate(), request.getSlotStart(), request.getSlotEnd())) {
                throw new ValidationException("Patient already has an overlapping appointment at this time.");
            }

            // 5. Check if patient already has an appointment with this doctor on this day
            if (appointmentRepository.existsByPatientIdAndDoctorIdAndSlotDateAndStatusNot(
                    request.getPatientId(), request.getDoctorId(), request.getSlotDate(), AppointmentStatus.CANCELLED)) {
                throw new ValidationException("Patient already has an appointment with this doctor on this day.");
            }

            Appointment saved = appointmentRepository.save(appointment);
            return appointmentMapper.toResponseDto(saved);

        } catch (ValidationException | ConflictException e) {
            throw e;
        } catch (Exception e) {
            log.error("Slot check error calling {}: {}", slotsUrl, e.getMessage());
            throw new ValidationException(
                    "Could not verify slot availability with Doctor Service. Error: " + e.getMessage());
        }
    }

    @Override
    public AppointmentResponseDTO getAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return appointmentMapper.toResponseDto(appointment);
    }

    @Override
    public Page<AppointmentResponseDTO> getAllAppointments(UUID patientId, UUID doctorId, LocalDate date,
            AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findWithFilters(patientId, doctorId, date, status, pageable)
                .map(appointmentMapper::toResponseDto);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO updateStatus(UUID id, StatusUpdateDTO statusUpdate) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Basic transition logic
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ConflictException("Cannot update status of a cancelled appointment.");
        }

        appointment.setStatus(statusUpdate.getStatus());
        if (statusUpdate.getStatus() == AppointmentStatus.CANCELLED) {
            appointment.setCancellationReason(statusUpdate.getCancellationReason());
        }

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO cancelAppointment(UUID id, CancellationRequestDTO cancellationRequest,
            UUID cancelledBy, String role) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ConflictException("Appointment is already cancelled.");
        }

        // Check cancellation window for patients
        if ("PATIENT".equalsIgnoreCase(role)) {
            LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getSlotDate(), appointment.getSlotStart());
            if (LocalDateTime.now().plusHours(2).isAfter(appointmentDateTime)) {
                throw new ValidationException("Appointments can only be cancelled up to 2 hours before the slot.");
            }
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cancellationRequest.getReason());

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public WaitlistResponseDTO addToWaitlist(WaitlistRequestDTO request) {
        Waitlist waitlist = appointmentMapper.toEntity(request);
        Waitlist saved = waitlistRepository.save(waitlist);
        return appointmentMapper.toResponseDto(saved);
    }
}
