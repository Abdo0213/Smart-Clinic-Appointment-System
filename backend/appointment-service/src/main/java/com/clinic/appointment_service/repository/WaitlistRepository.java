package com.clinic.appointment_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.clinic.appointment_service.entity.Waitlist;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, UUID> {
    List<Waitlist> findAllByDoctorIdAndPreferredDate(UUID doctorId, LocalDate preferredDate);
}
