package com.clinic.doctor_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponseDTO {
    private UUID id;
    private UUID doctorId;
    private java.time.LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration;
    private Double price;
    private List<BreakDTO> breaks;
}
