package com.clinic.doctor_service.controller;

import com.clinic.doctor_service.dto.*;
import com.clinic.doctor_service.service.interfaces.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<DoctorResponseDTO> createDoctor(@Valid @RequestBody DoctorRequestDTO request) {
        return new ResponseEntity<>(doctorService.createDoctor(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping
    public ResponseEntity<Page<DoctorResponseDTO>> getAllDoctors(
            @RequestParam(required = false) String specialization,
            Pageable pageable) {
        return ResponseEntity.ok(doctorService.getAllDoctors(specialization, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> updateDoctor(
            @PathVariable UUID id,
            @Valid @RequestBody DoctorRequestDTO request) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateDoctorStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        doctorService.updateDoctorStatus(id, isActive);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<ScheduleResponseDTO> createSchedule(
            @PathVariable UUID id,
            @Valid @RequestBody ScheduleRequestDTO request) {
        return new ResponseEntity<>(doctorService.createSchedule(id, request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<ScheduleResponseDTO>> getSchedules(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.getSchedulesByDoctorId(id));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<SlotResponseDTO> getSlots(
            @PathVariable UUID id,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(doctorService.getAvailableSlots(id, date));
    }

    @DeleteMapping("/{id}/schedules/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable UUID id,
            @PathVariable UUID scheduleId) {
        doctorService.deleteSchedule(id, scheduleId);
        return ResponseEntity.noContent().build();
    }
}
