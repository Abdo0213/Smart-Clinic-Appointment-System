package com.clinic.billing_service.repository;

import com.clinic.billing_service.entity.Invoice;
import com.clinic.billing_service.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Page<Invoice> findByPatientId(UUID patientId, Pageable pageable);
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);
    Page<Invoice> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    Page<Invoice> findByPatientIdAndStatusAndCreatedAtBetween(UUID patientId, InvoiceStatus status, LocalDateTime start, LocalDateTime end, Pageable pageable);
}
