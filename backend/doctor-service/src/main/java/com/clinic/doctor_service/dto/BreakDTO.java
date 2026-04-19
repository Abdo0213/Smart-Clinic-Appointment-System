package com.clinic.doctor_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BreakDTO {
    @NotNull(message = "Break start time is required")
    private LocalTime breakStart;
    @NotNull(message = "Break end time is required")
    private LocalTime breakEnd;
}
