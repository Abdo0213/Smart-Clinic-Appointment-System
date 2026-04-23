package com.clinic.billing_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaiveRequest {
    @NotBlank(message = "Reason is required for waiving an invoice")
    private String reason;
}
