package com.clinic.appointment_service.dto;

import com.clinic.appointment_service.entity.AppointmentStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateDTO {
    @NotNull(message = "Status is required")
    private AppointmentStatus status;
    private String cancellationReason;
}
