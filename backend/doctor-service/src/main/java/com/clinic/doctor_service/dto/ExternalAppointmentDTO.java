package com.clinic.doctor_service.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class ExternalAppointmentDTO {
    private LocalTime slotStart;
    private LocalTime slotEnd;
    private String status;
}
