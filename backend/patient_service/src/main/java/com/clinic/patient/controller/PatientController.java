package com.clinic.patient.controller;

import com.clinic.patient.dto.*;
import com.clinic.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {
    
    private final PatientService service;

    @PostMapping
    public PatientResponse create(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody PatientRequest req) {
        
        // If the request body doesn't have a userId, but we have one in the header (self-registration), use it.
        // If the request body ALREADY has a userId (receptionist creating for someone else), keep it.
        if (req.getUserId() == null && headerUserId != null && !headerUserId.isEmpty()) {
            req.setUserId(UUID.fromString(headerUserId));
        }
        
        return service.create(req);
    }

    @GetMapping("/{id}")
    public PatientResponse get(@PathVariable UUID id){
        return service.getById(id);
    }

    @GetMapping("/me")
    public PatientResponse getMe(@RequestHeader("X-User-Id") String userId) {
        return service.getByUserId(UUID.fromString(userId));
    }

    @GetMapping("/user/{userId}")
    public PatientResponse getByUserId(@PathVariable UUID userId) {
        return service.getByUserId(userId);
    }

    @GetMapping("/{id}/visits")
    public Object getVisits(@PathVariable UUID id) {
        return service.getVisitsForPatient(id);
    }

    @GetMapping("/me/visits")
    public Object getMyVisits(@RequestHeader("X-User-Id") String userId) {
        PatientResponse p = service.getByUserId(UUID.fromString(userId));
        return service.getVisitsForPatient(p.getId());
    }

    @GetMapping("/me/invoices")
    public Object getMyInvoices(@RequestHeader("X-User-Id") String userId) {
        PatientResponse p = service.getByUserId(UUID.fromString(userId));
        return service.getInvoicesForPatient(p.getId());
    }

    @PutMapping("/{id}")
    public PatientResponse update(@PathVariable UUID id, @RequestBody PatientRequest req){
        return service.update(id, req);
    }

    @GetMapping
    public Page<PatientResponse> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size){
        
        // Using a combined search query if either name or phone is provided
        String query = (name != null) ? name : phone;
        return service.getAll(query, page, size);
    }
}
