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
public class VisitResponse {
    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private String chiefComplaint;
    private String examinationFindings;
    private String assessment;
    private String plan;
    private String icd10Codes;
    private Boolean isSigned;
    private LocalDateTime signedAt;
    private Integer version;
    private UUID parentRecordId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
