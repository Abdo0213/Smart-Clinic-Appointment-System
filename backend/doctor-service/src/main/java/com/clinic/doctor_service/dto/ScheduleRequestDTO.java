package com.clinic.doctor_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleRequestDTO {

    @NotNull(message = "Day of week is required")
    @Min(0) @Max(6)
    private Integer dayOfWeek;

    @NotNull(message = "Start time is required")
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @NotNull(message = "Slot duration is required")
    @Min(5)
    private Integer slotDuration;

    @NotNull(message = "Price is required")
    @Min(0)
    private Double price;

    private List<BreakDTO> breaks;
}
