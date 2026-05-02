package com.clinic.visit_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitRequest {

    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;

    private String chiefComplaint;
    private String examinationFindings;
    private String assessment;
    private String plan;
    private String icd10Codes;
}
