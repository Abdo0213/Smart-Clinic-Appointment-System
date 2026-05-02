package com.clinic.appointment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancellationRequestDTO {
    @NotBlank(message = "Reason is required")
    private String reason;
}
