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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

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
    private final RestTemplate restTemplate;

    @Value("${services.appointment.url}")
    private String appointmentServiceUrl;

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
        System.out.println("DEBUG: Doctor ID: " + id + ", isActive: " + doctor.isActive());
        return doctorMapper.toResponseDto(doctor);
    }

    @Override
    public Page<DoctorResponseDTO> getAllDoctors(String specialization, Boolean isActive, Pageable pageable) {
        Page<Doctor> doctors;
        boolean hasSpecialization = specialization != null && !specialization.isEmpty();
        boolean hasIsActive = isActive != null;

        if (hasSpecialization && hasIsActive) {
            doctors = doctorRepository.findBySpecializationContainingIgnoreCaseAndActive(specialization, isActive,
                    pageable);
        } else if (hasSpecialization) {
            doctors = doctorRepository.findBySpecializationContainingIgnoreCase(specialization, pageable);
        } else if (hasIsActive) {
            doctors = doctorRepository.findByActive(isActive, pageable);
        } else {
            doctors = doctorRepository.findAll(pageable);
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
    public void updateDoctorStatus(UUID id, boolean isActive) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        doctor.setActive(isActive);
        doctorRepository.save(doctor);
    }

    @Override
    @Transactional
    public ScheduleResponseDTO createSchedule(UUID doctorId, ScheduleRequestDTO request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        Schedule schedule = doctorMapper.toEntity(request);
        schedule.setDoctor(doctor);

        // Validate no overlaps
        List<Schedule> existingSchedules = scheduleRepository.findByDoctorIdAndDate(doctorId, schedule.getDate());
        for (Schedule existing : existingSchedules) {
            if (schedule.getStartTime().isBefore(existing.getEndTime()) &&
                    schedule.getEndTime().isAfter(existing.getStartTime())) {
                throw new ScheduleConflictException(
                        "Selected schedule overlaps with an existing schedule for this doctor on the same day.");
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

        List<Schedule> schedules = scheduleRepository.findByDoctorIdAndDate(doctorId, date);

        List<ExternalAppointmentDTO> bookedAppointments = fetchBookedAppointments(doctorId, date);

        List<SlotDTO> slots = new ArrayList<>();
        for (Schedule schedule : schedules) {
            LocalTime current = schedule.getStartTime();
            while (current.plusMinutes(schedule.getSlotDuration()).isBefore(schedule.getEndTime()) ||
                    current.plusMinutes(schedule.getSlotDuration()).equals(schedule.getEndTime())) {

                LocalTime end = current.plusMinutes(schedule.getSlotDuration());
                boolean isBreak = isDuringBreak(current, end, schedule.getBreaks());

                // Check if slot is already booked
                boolean isBooked = isSlotBooked(current, end, bookedAppointments);

                String reason = null;
                if (isBreak)
                    reason = "BREAK";
                else if (isBooked)
                    reason = "BOOKED";

                slots.add(SlotDTO.builder()
                        .start(current)
                        .end(end)
                        .available(!isBreak && !isBooked)
                        .price(schedule.getPrice())
                        .reason(reason)
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
        if (breaks == null)
            return false;
        for (ScheduleBreak b : breaks) {
            // If the slot overlaps with any break
            if (start.isBefore(b.getBreakEnd()) && end.isAfter(b.getBreakStart())) {
                return true;
            }
        }
        return false;
    }

    private List<ExternalAppointmentDTO> fetchBookedAppointments(UUID doctorId, LocalDate date) {
        String url = UriComponentsBuilder.fromUriString(appointmentServiceUrl)
                .queryParam("doctorId", doctorId)
                .queryParam("date", date)
                .toUriString();

        try {
            // We use a custom response wrapper or Map to get the content from the Page
            java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);
            if (response != null && response.get("content") != null) {
                List<java.util.Map<String, Object>> content = (List<java.util.Map<String, Object>>) response
                        .get("content");
                return content.stream()
                        .map(map -> {
                            ExternalAppointmentDTO dto = new ExternalAppointmentDTO();
                            dto.setSlotStart(LocalTime.parse(map.get("slotStart").toString()));
                            dto.setSlotEnd(LocalTime.parse(map.get("slotEnd").toString()));
                            dto.setStatus(map.get("status").toString());
                            return dto;
                        })
                        .filter(app -> "CONFIRMED".equals(app.getStatus()) || "REQUESTED".equals(app.getStatus()))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            // In a production app, use a logger
            System.err.println("Error fetching appointments from appointment-service: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    private boolean isSlotBooked(LocalTime start, LocalTime end, List<ExternalAppointmentDTO> bookedAppointments) {
        for (ExternalAppointmentDTO app : bookedAppointments) {
            // Check for exact match or overlap
            // Typically slots are fixed, so we check if this slot is the same as the booked
            // one
            if (start.equals(app.getSlotStart()) && end.equals(app.getSlotEnd())) {
                return true;
            }
        }
        return false;
    }
}
