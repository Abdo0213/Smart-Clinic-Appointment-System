package com.clinic.visit_service.controller;

import com.clinic.visit_service.dto.*;
import com.clinic.visit_service.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping
    public ResponseEntity<VisitResponse> createVisit(@Valid @RequestBody VisitRequest request) {
        return new ResponseEntity<>(visitService.createVisit(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitResponse> getVisitById(@PathVariable UUID id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }

    @GetMapping
    public ResponseEntity<Page<VisitResponse>> getAllVisits(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(visitService.getAllVisits(patientId, doctorId, dateFrom, dateTo, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<VisitResponse>> getAllVisitsNoPagination() {
        return ResponseEntity.ok(visitService.getAllVisitsWithoutPagination());
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitResponse> updateVisit(@PathVariable UUID id, @Valid @RequestBody VisitRequest request) {
        return ResponseEntity.ok(visitService.updateVisit(id, request));
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<VisitResponse> signVisit(
            @PathVariable UUID id,
            @RequestBody(required = false) SignVisitRequest request) {
        return ResponseEntity.ok(visitService.signVisit(id, request));
    }

    @PostMapping("/{id}/amend")
    public ResponseEntity<VisitResponse> amendVisit(@PathVariable UUID id, @Valid @RequestBody VisitRequest request) {
        return new ResponseEntity<>(visitService.amendVisit(id, request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/prescriptions")
    public ResponseEntity<PrescriptionResponse> issuePrescription(@PathVariable UUID id, @Valid @RequestBody PrescriptionRequest request) {
        return new ResponseEntity<>(visitService.issuePrescription(id, request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/follow-up")
    public ResponseEntity<FollowUpResponse> scheduleFollowUp(@PathVariable UUID id, @Valid @RequestBody FollowUpRequest request) {
        return new ResponseEntity<>(visitService.scheduleFollowUp(id, request), HttpStatus.CREATED);
    }

    @GetMapping("/billing-options")
    public ResponseEntity<java.util.List<LineItemRequest>> getBillingOptions() {
        return ResponseEntity.ok(visitService.getBillingOptions());
    }
}
