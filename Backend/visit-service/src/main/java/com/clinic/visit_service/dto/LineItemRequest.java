package com.clinic.visit_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineItemRequest {
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
}
