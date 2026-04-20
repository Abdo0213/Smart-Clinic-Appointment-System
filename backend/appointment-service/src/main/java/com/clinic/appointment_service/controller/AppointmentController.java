package com.clinic.appointment_service.controller;

import com.clinic.appointment_service.dto.*;
import com.clinic.appointment_service.entity.AppointmentStatus;
import com.clinic.appointment_service.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(@Valid @RequestBody AppointmentRequestDTO request) {
        // Mocking bookedBy from a header or similar for now until Security is fully
        // setup
        // In a real app, this would come from the JWT token
        UUID bookedBy = UUID.randomUUID();
        return new ResponseEntity<>(appointmentService.bookAppointment(request, bookedBy), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.getAppointment(id));
    }

    @GetMapping
    public ResponseEntity<Page<AppointmentResponseDTO>> getAllAppointments(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AppointmentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(patientId, doctorId, date, status, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateDTO statusUpdate) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, statusUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody CancellationRequestDTO cancellationRequest) {
        // Mocking values for now
        UUID cancelledBy = UUID.randomUUID();
        String role = "PATIENT"; // or RECEPTIONIST
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, cancellationRequest, cancelledBy, role));
    }

    @PostMapping("/{id}/waitlist")
    public ResponseEntity<WaitlistResponseDTO> addToWaitlist(
            @PathVariable UUID id, // The original appointment ID that was full
            @Valid @RequestBody WaitlistRequestDTO request) {
        return new ResponseEntity<>(appointmentService.addToWaitlist(request), HttpStatus.CREATED);
    }
}
