package com.clinic.patient.service;
import com.clinic.patient.dto.*;
import com.clinic.patient.entity.Patient;
import com.clinic.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository repo;

    public PatientResponse create(PatientRequest req){
        Patient p = new Patient();
        
        p.setUserId(req.getUserId());
        p.setFirstName(req.getFirstName());
        p.setLastName(req.getLastName());
        p.setPhone(req.getPhone());
        p.setCreatedAt(LocalDateTime.now());

        repo.save(p);
        return PatientResponse.builder()
               .id(p.getId())
               .firstName(p.getFirstName())
               .lastName(p.getLastName())
               .phone(p.getPhone())
               .createdAt(p.getCreatedAt())
               .build();
    }
    public Patient get(UUID id){
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Patient Not Found"));
    }
}
