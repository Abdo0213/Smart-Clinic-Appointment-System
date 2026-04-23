package com.clinic.billing_service.service;

import com.clinic.billing_service.dto.*;
import com.clinic.billing_service.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface BillingService {
    InvoiceDTO createInvoice(InvoiceRequest request);
    InvoiceDTO getInvoiceById(UUID id);
    Page<InvoiceDTO> getAllInvoices(UUID patientId, InvoiceStatus status, LocalDateTime dateFrom, LocalDateTime dateTo, Pageable pageable);
    InvoiceDTO updateLineItems(UUID id, UpdateLineItemsRequest request);
    InvoiceDTO markAsPaid(UUID id);
    InvoiceDTO waiveInvoice(UUID id, WaiveRequest request);
}
