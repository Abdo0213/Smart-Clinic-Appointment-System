package com.clinic.patient.controller;

import com.clinic.patient.dto.*;
import com.clinic.patient.entity.Patient;
import com.clinic.patient.service.PatientService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {
    
    private final PatientService service;

    @PostMapping
    public PatientResponse create(@RequestBody PatientRequest req){
        return service.create(req);
    }

    @GetMapping("/{id}")
    public Patient get(@PathVariable UUID id){
        return service.get(id);
    }


}
