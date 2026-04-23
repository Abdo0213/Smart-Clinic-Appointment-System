package com.clinic.visit_service.dto.external;

import lombok.Data;
import java.util.UUID;

@Data
public class AppointmentDTO {
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private String status;
    private Double price;
}
