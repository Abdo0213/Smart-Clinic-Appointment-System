package com.clinic.appointment_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class AppointmentRequestDTO {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    @NotNull(message = "Slot date is required")
    private LocalDate slotDate;

    @NotNull(message = "Slot start time is required")
    private LocalTime slotStart;

    @NotNull(message = "Slot end time is required")
    private LocalTime slotEnd;
}
