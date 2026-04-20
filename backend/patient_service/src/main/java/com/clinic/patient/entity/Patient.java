package com.clinic.patient.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name="patients")
@Data
public class Patient {
    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;

    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;

    private String phone;
    private String address;

    private String bloodType;
    private String KnownAllergies;

    private String emergencyContact;
    private String emergencyPhone;

    private String insuranceProvider;
    private String insuranceNumber;

    private LocalDateTime createdAt;
    private LocalDateTime UpdatedAt;
}
