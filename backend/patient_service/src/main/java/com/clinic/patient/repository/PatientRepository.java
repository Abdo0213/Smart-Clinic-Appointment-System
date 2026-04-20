package com.clinic.patient.repository;

import com.clinic.patient.entity.Patient;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient,UUID>{

    
}
