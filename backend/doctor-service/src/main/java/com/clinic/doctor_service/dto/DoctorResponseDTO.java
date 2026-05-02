package com.clinic.doctor_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponseDTO {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String specialization;
    private String bio;
    private String phone;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean active;
    private LocalDateTime createdAt;
}
