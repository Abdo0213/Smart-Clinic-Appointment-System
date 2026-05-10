package com.clinic.appointment_service.dto.external;

import lombok.Data;
import java.util.UUID;

@Data
public class PatientDTO {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
}
