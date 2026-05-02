package com.clinic.billing_service.controller;

import com.clinic.billing_service.dto.*;
import com.clinic.billing_service.entity.InvoiceStatus;
import com.clinic.billing_service.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/billing/invoices")
@RequiredArgsConstructor
public class BillingController {

    @Autowired
    private final BillingService billingService;

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return new ResponseEntity<>(billingService.createInvoice(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceDTO>> getAllInvoices(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            Pageable pageable) {
        return ResponseEntity.ok(billingService.getAllInvoices(patientId, status, dateFrom, dateTo, pageable));
    }

    @PutMapping("/{id}/line-items")
    public ResponseEntity<InvoiceDTO> updateLineItems(@PathVariable UUID id, @Valid @RequestBody UpdateLineItemsRequest request) {
        return ResponseEntity.ok(billingService.updateLineItems(id, request));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<InvoiceDTO> markAsPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(billingService.markAsPaid(id));
    }

    @PatchMapping("/{id}/waive")
    public ResponseEntity<InvoiceDTO> waiveInvoice(@PathVariable UUID id, @Valid @RequestBody WaiveRequest request) {
        return ResponseEntity.ok(billingService.waiveInvoice(id, request));
    }
}
