package com.clinic.doctor_service.repository;

import com.clinic.doctor_service.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Page<Doctor> findByActive(boolean active, Pageable pageable);

    Page<Doctor> findBySpecializationContainingIgnoreCaseAndActive(String specialization, boolean active,
            Pageable pageable);

    Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);
}
