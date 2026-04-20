package com.clinic.appointment_service.service;

import com.clinic.appointment_service.dto.*;
import com.clinic.appointment_service.entity.AppointmentStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface AppointmentService {
    AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request, UUID bookedBy);

    AppointmentResponseDTO getAppointment(UUID id);

    Page<AppointmentResponseDTO> getAllAppointments(UUID patientId, UUID doctorId, LocalDate date,
            AppointmentStatus status, Pageable pageable);

    AppointmentResponseDTO updateStatus(UUID id, StatusUpdateDTO statusUpdate);

    AppointmentResponseDTO cancelAppointment(UUID id, CancellationRequestDTO cancellationRequest, UUID cancelledBy,
            String role);

    WaitlistResponseDTO addToWaitlist(WaitlistRequestDTO request);
}
