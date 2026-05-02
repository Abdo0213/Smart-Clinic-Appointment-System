package com.clinic.billing_service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @NotNull(message = "Visit ID is required")
    private UUID visitId;

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;

    @NotEmpty(message = "Line items cannot be empty")
    private List<LineItemRequest> lineItems;
}
