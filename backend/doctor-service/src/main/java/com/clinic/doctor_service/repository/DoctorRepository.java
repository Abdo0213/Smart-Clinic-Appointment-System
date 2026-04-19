package com.clinic.doctor_service.repository;

import com.clinic.doctor_service.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Page<Doctor> findByIsActiveTrue(Pageable pageable);
    Page<Doctor> findBySpecializationContainingIgnoreCaseAndIsActiveTrue(String specialization, Pageable pageable);
}
