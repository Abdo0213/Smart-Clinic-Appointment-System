package com.clinic.appointment_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class WaitlistResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private LocalDate preferredDate;
    private LocalDateTime addedAt;
}
