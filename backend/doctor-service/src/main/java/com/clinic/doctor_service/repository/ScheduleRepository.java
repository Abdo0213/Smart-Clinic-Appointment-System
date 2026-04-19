package com.clinic.doctor_service.repository;

import com.clinic.doctor_service.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {
    List<Schedule> findByDoctorId(UUID doctorId);
    List<Schedule> findByDoctorIdAndDayOfWeek(UUID doctorId, Integer dayOfWeek);
}
