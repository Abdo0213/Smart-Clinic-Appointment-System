package com.clinic.billing_service.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLineItemsRequest {
    @NotEmpty(message = "Line items cannot be empty")
    private List<LineItemRequest> lineItems;
}
