package com.clinic.appointment_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import com.clinic.appointment_service.entity.AppointmentStatus;

@Data
public class AppointmentResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private LocalDate slotDate;
    private LocalTime slotStart;
    private LocalTime slotEnd;
    private AppointmentStatus status;
    private Double price;
    private UUID bookedBy;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
