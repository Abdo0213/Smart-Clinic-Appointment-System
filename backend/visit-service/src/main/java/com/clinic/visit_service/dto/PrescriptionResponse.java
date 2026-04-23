package com.clinic.visit_service.dto;

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
public class PrescriptionResponse {
    private UUID id;
    private UUID visitId;
    private UUID patientId;
    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String notes;
    private LocalDateTime issuedAt;
    private String pdfDownloadUrl;
}
