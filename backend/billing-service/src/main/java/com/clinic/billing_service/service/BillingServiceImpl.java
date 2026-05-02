package com.clinic.billing_service.service;

import com.clinic.billing_service.dto.*;
import com.clinic.billing_service.entity.Invoice;
import com.clinic.billing_service.entity.InvoiceStatus;
import com.clinic.billing_service.entity.LineItem;
import com.clinic.billing_service.exception.ExternalServiceException;
import com.clinic.billing_service.exception.InvalidStateTransitionException;
import com.clinic.billing_service.exception.ResourceNotFoundException;
import com.clinic.billing_service.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingServiceImpl implements BillingService {

    private final InvoiceRepository invoiceRepository;
    private final RestTemplate restTemplate;

    @Value("${services.patient.url:http://localhost:8083/patients}")
    private String patientServiceUrl;

    @Value("${services.appointment.url:http://localhost:8084/appointments}")
    private String appointmentServiceUrl;

    @Value("${services.visit.url:http://localhost:8085/visits}")
    private String visitServiceUrl;

    @Override
    @Transactional
    public InvoiceDTO createInvoice(InvoiceRequest request) {
        log.info("Creating invoice for visit: {}, patient: {}", request.getVisitId(), request.getPatientId());

        // 1. Check patient exists (8083)
        checkPatientExists(request.getPatientId());

        // 2. Check appointment exists (8084)
        checkAppointmentExists(request.getAppointmentId());

        // 3. Check visit exists (8085)
        checkVisitExists(request.getVisitId());

        // 4. Create Invoice
        Invoice invoice = Invoice.builder()
                .visitId(request.getVisitId())
                .patientId(request.getPatientId())
                .status(InvoiceStatus.PENDING)
                .build();

        request.getLineItems().forEach(itemRequest -> {
            BigDecimal unitPrice = itemRequest.getUnitPrice();
            Integer quantity = itemRequest.getQuantity();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));

            LineItem lineItem = LineItem.builder()
                    .description(itemRequest.getDescription())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .build();
            invoice.addLineItem(lineItem);
        });

        invoice.calculateTotal();
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 4. Update appointment status to CONFIRMED (8084)
        updateAppointmentStatus(request.getAppointmentId(), "CONFIRMED");

        return mapToDTO(savedInvoice);
    }

    @Override
    public InvoiceDTO getInvoiceById(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return mapToDTO(invoice);
    }

    @Override
    public Page<InvoiceDTO> getAllInvoices(UUID patientId, InvoiceStatus status, LocalDateTime dateFrom,
            LocalDateTime dateTo, Pageable pageable) {
        Page<Invoice> invoices;
        if (patientId != null && status != null && dateFrom != null && dateTo != null) {
            invoices = invoiceRepository.findByPatientIdAndStatusAndCreatedAtBetween(patientId, status, dateFrom,
                    dateTo, pageable);
        } else if (patientId != null) {
            invoices = invoiceRepository.findByPatientId(patientId, pageable);
        } else if (status != null) {
            invoices = invoiceRepository.findByStatus(status, pageable);
        } else if (dateFrom != null && dateTo != null) {
            invoices = invoiceRepository.findByCreatedAtBetween(dateFrom, dateTo, pageable);
        } else {
            invoices = invoiceRepository.findAll(pageable);
        }
        return invoices.map(this::mapToDTO);
    }

    @Override
    @Transactional
    public InvoiceDTO updateLineItems(UUID id, UpdateLineItemsRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (invoice.getStatus() != InvoiceStatus.PENDING) {
            throw new InvalidStateTransitionException(
                    "Cannot update line items for invoice with status: " + invoice.getStatus());
        }

        invoice.getLineItems().clear();
        request.getLineItems().forEach(itemRequest -> {
            BigDecimal unitPrice = itemRequest.getUnitPrice();
            Integer quantity = itemRequest.getQuantity();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));

            LineItem lineItem = LineItem.builder()
                    .description(itemRequest.getDescription())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .build();
            invoice.addLineItem(lineItem);
        });

        invoice.calculateTotal();
        return mapToDTO(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceDTO markAsPaid(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (invoice.getStatus() != InvoiceStatus.PENDING) {
            throw new InvalidStateTransitionException("Invoice is already " + invoice.getStatus());
        }

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        return mapToDTO(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceDTO waiveInvoice(UUID id, WaiveRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (invoice.getStatus() != InvoiceStatus.PENDING) {
            throw new InvalidStateTransitionException("Cannot waive invoice with status: " + invoice.getStatus());
        }

        invoice.setStatus(InvoiceStatus.WAIVED);
        invoice.setWaiverReason(request.getReason());
        // In a real app, you'd get the admin name from the security context
        invoice.setWaivedBy("ADMIN");
        return mapToDTO(invoiceRepository.save(invoice));
    }

    private void checkPatientExists(UUID patientId) {
        try {
            restTemplate.getForEntity(patientServiceUrl + "/" + patientId, Object.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ExternalServiceException("Patient not found in Patient Service: " + patientId);
        } catch (Exception e) {
            throw new ExternalServiceException("Error communicating with Patient Service: " + e.getMessage());
        }
    }

    private void checkAppointmentExists(UUID appointmentId) {
        try {
            restTemplate.getForEntity(appointmentServiceUrl + "/" + appointmentId, Object.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ExternalServiceException("Appointment not found in Appointment Service: " + appointmentId);
        } catch (Exception e) {
            throw new ExternalServiceException("Error communicating with Appointment Service: " + e.getMessage());
        }
    }

    private void checkVisitExists(UUID visitId) {
        try {
            restTemplate.getForEntity(visitServiceUrl + "/" + visitId, Object.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ExternalServiceException("Visit not found in Visit Service: " + visitId);
        } catch (Exception e) {
            throw new ExternalServiceException("Error communicating with Visit Service: " + e.getMessage());
        }
    }

    private void updateAppointmentStatus(UUID appointmentId, String status) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("status", status);
            body.put("cancellationReason", null);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body);
            restTemplate.exchange(appointmentServiceUrl + "/" + appointmentId + "/status", HttpMethod.PATCH, entity,
                    Object.class);
            log.info("Successfully updated appointment {} status to {}", appointmentId, status);
        } catch (Exception e) {
            log.error("Failed to update appointment status: {}", e.getMessage());
            // Should we roll back? The user said "after succes billing",
            // so if this fails, maybe we should notify or throw an exception to roll back
            // the invoice creation.
            throw new ExternalServiceException("Failed to update appointment status: " + e.getMessage());
        }
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .visitId(invoice.getVisitId())
                .patientId(invoice.getPatientId())
                .status(invoice.getStatus())
                .totalAmount(invoice.getTotalAmount())
                .createdAt(invoice.getCreatedAt())
                .paidAt(invoice.getPaidAt())
                .waivedBy(invoice.getWaivedBy())
                .waiverReason(invoice.getWaiverReason())
                .lineItems(invoice.getLineItems().stream()
                        .map(item -> LineItemDTO.builder()
                                .id(item.getId())
                                .description(item.getDescription())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
