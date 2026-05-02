package com.clinic.visit_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUpResponse {
    private UUID followUpId;
    private UUID appointmentId;
    private UUID sourceVisitId;
    private LocalDate slotDate;
    private String status;
}
