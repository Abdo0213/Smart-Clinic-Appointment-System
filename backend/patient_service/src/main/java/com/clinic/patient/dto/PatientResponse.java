package com.clinic.patient.dto;

import lombok.Builder;
import lombok.Data;
import java.time.*;
import java.util.UUID;

@Data
@Builder
public class PatientResponse {
    public UUID id;
    public String firstName;
    public String lastName;
    public LocalDateTime createdAt;
    public String phone;
}
