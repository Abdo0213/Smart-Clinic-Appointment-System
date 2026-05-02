package com.clinic.patient.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientRequest {
    public UUID userId;
    public String firstName;
    public String lastName;
    public LocalDate dateOfBirth;
    public String gender;
    public String phone;
    public String address;
    public String bloodType;
    public String knownAllergies;
    public String emergencyContact;
    public String emergencyPhone;
    public String insuranceProvider;
    public String insuranceNumber;
}
