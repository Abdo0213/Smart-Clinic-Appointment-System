package com.clinic.visit_service.service;

import com.clinic.visit_service.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface VisitService {
    VisitResponse createVisit(VisitRequest request);
    VisitResponse getVisitById(UUID id);
    Page<VisitResponse> getAllVisits(UUID patientId, UUID doctorId, LocalDate dateFrom, LocalDate dateTo, Pageable pageable);
    VisitResponse updateVisit(UUID id, VisitRequest request);
    VisitResponse signVisit(UUID id, SignVisitRequest request);
    VisitResponse amendVisit(UUID id, VisitRequest request);
    PrescriptionResponse issuePrescription(UUID visitId, PrescriptionRequest request);
    FollowUpResponse scheduleFollowUp(UUID visitId, FollowUpRequest request);
    java.util.List<LineItemRequest> getBillingOptions();
}
