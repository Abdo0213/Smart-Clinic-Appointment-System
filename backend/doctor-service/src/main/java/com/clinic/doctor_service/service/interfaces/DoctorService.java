package com.clinic.doctor_service.service.interfaces;

import com.clinic.doctor_service.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DoctorService {
    DoctorResponseDTO createDoctor(DoctorRequestDTO request);
    DoctorResponseDTO getDoctorById(UUID id);
    Page<DoctorResponseDTO> getAllDoctors(String specialization, Pageable pageable);
    DoctorResponseDTO updateDoctor(UUID id, DoctorRequestDTO request);
    void updateDoctorStatus(UUID id, boolean isActive);
    
    ScheduleResponseDTO createSchedule(UUID doctorId, ScheduleRequestDTO request);
    List<ScheduleResponseDTO> getSchedulesByDoctorId(UUID doctorId);
    void deleteSchedule(UUID doctorId, UUID scheduleId);
    SlotResponseDTO getAvailableSlots(UUID doctorId, java.time.LocalDate date);
}
