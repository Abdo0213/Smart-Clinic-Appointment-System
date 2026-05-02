package com.clinic.patient.dto;

import lombok.Builder;
import lombok.Data;
import java.time.*;
import java.util.UUID;

@Data
@Builder
public class PatientResponse {
    public UUID id;
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
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
