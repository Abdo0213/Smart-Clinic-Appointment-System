package com.clinic.billing_service.dto;

import com.clinic.billing_service.entity.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private UUID id;
    private UUID visitId;
    private UUID patientId;
    private InvoiceStatus status;
    private BigDecimal totalAmount;
    private List<LineItemDTO> lineItems;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String waivedBy;
    private String waiverReason;
}
