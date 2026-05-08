package com.clinic.appointment_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleRequestDTO {
    @NotNull
    private LocalDate newSlotDate;
    
    @NotNull
    private LocalTime newSlotStart;
    
    @NotNull
    private LocalTime newSlotEnd;
}
