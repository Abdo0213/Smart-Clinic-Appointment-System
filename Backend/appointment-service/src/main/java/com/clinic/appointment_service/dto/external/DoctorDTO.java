package com.clinic.appointment_service.dto.external;

import lombok.Data;
import java.util.UUID;

@Data
public class DoctorDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String specialization;
    private boolean isActive;
}
