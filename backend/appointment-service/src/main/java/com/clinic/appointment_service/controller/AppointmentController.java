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
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody AppointmentRequestDTO request) {
        
        UUID bookedBy = (userId != null && !userId.isEmpty()) ? UUID.fromString(userId) : UUID.randomUUID();
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

    @GetMapping("/all")
    public ResponseEntity<java.util.List<AppointmentResponseDTO>> getAllAppointmentsNoPagination() {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsWithoutPagination());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateDTO statusUpdate) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, statusUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable UUID id,
            @Valid @RequestBody CancellationRequestDTO cancellationRequest) {
        
        UUID cancelledBy = (userId != null && !userId.isEmpty()) ? UUID.fromString(userId) : UUID.randomUUID();
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
