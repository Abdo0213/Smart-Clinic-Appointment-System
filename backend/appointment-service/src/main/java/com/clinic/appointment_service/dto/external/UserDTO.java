package com.clinic.appointment_service.dto.external;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDTO {
    private String id;
    private String email;
    private String userName;
    private String role;
}
