package com.clinic.doctor_service.service.impl;

import com.clinic.doctor_service.dto.*;
import com.clinic.doctor_service.entity.*;
import com.clinic.doctor_service.exception.ResourceNotFoundException;
import com.clinic.doctor_service.exception.ScheduleConflictException;
import com.clinic.doctor_service.mapper.DoctorMapper;
import com.clinic.doctor_service.repository.DoctorRepository;
import com.clinic.doctor_service.repository.ScheduleRepository;
import com.clinic.doctor_service.service.interfaces.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final ScheduleRepository scheduleRepository;
    private final DoctorMapper doctorMapper;

    @Override
    @Transactional
    public DoctorResponseDTO createDoctor(DoctorRequestDTO request) {
        Doctor doctor = doctorMapper.toEntity(request);
        Doctor savedDoctor = doctorRepository.save(doctor);
        return doctorMapper.toResponseDto(savedDoctor);
    }

    @Override
    public DoctorResponseDTO getDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return doctorMapper.toResponseDto(doctor);
    }

    @Override
    public Page<DoctorResponseDTO> getAllDoctors(String specialization, Pageable pageable) {
        Page<Doctor> doctors;
        if (specialization != null && !specialization.isEmpty()) {
            doctors = doctorRepository.findBySpecializationContainingIgnoreCaseAndIsActiveTrue(specialization, pageable);
        } else {
            doctors = doctorRepository.findByIsActiveTrue(pageable);
        }
        return doctors.map(doctorMapper::toResponseDto);
    }

    @Override
    @Transactional
    public DoctorResponseDTO updateDoctor(UUID id, DoctorRequestDTO request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        doctorMapper.updateDoctorFromDto(request, doctor);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        return doctorMapper.toResponseDto(updatedDoctor);
    }

    @Override
    @Transactional
    public ScheduleResponseDTO createSchedule(UUID doctorId, ScheduleRequestDTO request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        Schedule schedule = doctorMapper.toEntity(request);
        schedule.setDoctor(doctor);
        
        // Validate no overlaps
        List<Schedule> existingSchedules = scheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, schedule.getDayOfWeek());
        for (Schedule existing : existingSchedules) {
            if (schedule.getStartTime().isBefore(existing.getEndTime()) && 
                schedule.getEndTime().isAfter(existing.getStartTime())) {
                throw new ScheduleConflictException("Selected schedule overlaps with an existing schedule for this doctor on the same day.");
            }
        }

        if (schedule.getBreaks() != null) {
            schedule.getBreaks().forEach(b -> b.setSchedule(schedule));
        }

        Schedule savedSchedule = scheduleRepository.save(schedule);
        return doctorMapper.toResponseDto(savedSchedule);
    }

    @Override
    public List<ScheduleResponseDTO> getSchedulesByDoctorId(UUID doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
        }
        return scheduleRepository.findByDoctorId(doctorId).stream()
                .map(doctorMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSchedule(UUID doctorId, UUID scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));
        
        if (!schedule.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Schedule does not belong to this doctor");
        }
        
        scheduleRepository.delete(schedule);
    }

    @Override
    public SlotResponseDTO getAvailableSlots(UUID doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Convert to 0-6 (Sunday start if needed, or check logic)
        // Note: java.time.DayOfWeek: 1(Mon)-7(Sun). My API: 0(Sun)-6(Sat) or similar.
        // Assuming 0=Sunday, 1=Monday... 6=Saturday. Java: Mon=1, ..., Sat=6, Sun=7.
        // So (date.getDayOfWeek().getValue() % 7) gives Sun=0, Mon=1, ..., Sat=6. Matches.

        List<Schedule> schedules = scheduleRepository.findByDoctorId(doctorId).stream()
                .filter(s -> s.getDayOfWeek().equals(dayOfWeek))
                .collect(Collectors.toList());

        List<SlotDTO> slots = new ArrayList<>();
        for (Schedule schedule : schedules) {
            LocalTime current = schedule.getStartTime();
            while (current.plusMinutes(schedule.getSlotDuration()).isBefore(schedule.getEndTime()) || 
                   current.plusMinutes(schedule.getSlotDuration()).equals(schedule.getEndTime())) {
                
                LocalTime end = current.plusMinutes(schedule.getSlotDuration());
                boolean isBreak = isDuringBreak(current, end, schedule.getBreaks());
                
                slots.add(SlotDTO.builder()
                        .start(current)
                        .end(end)
                        .available(!isBreak) // Mark as unavailable if it's a break. 
                        // In real app, we'd also check booked appointments here.
                        .build());
                
                current = end;
            }
        }

        return SlotResponseDTO.builder()
                .doctorId(doctorId)
                .date(date)
                .slots(slots)
                .build();
    }

    private boolean isDuringBreak(LocalTime start, LocalTime end, List<ScheduleBreak> breaks) {
        if (breaks == null) return false;
        for (ScheduleBreak b : breaks) {
            // If the slot overlaps with any break
            if (start.isBefore(b.getBreakEnd()) && end.isAfter(b.getBreakStart())) {
                return true;
            }
        }
        return false;
    }
}
