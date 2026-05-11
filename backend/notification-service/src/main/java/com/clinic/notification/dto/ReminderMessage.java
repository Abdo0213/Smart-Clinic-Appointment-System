package com.clinic.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderMessage {
    private UUID appointmentId;
    private UUID userId;
    private String email;
    private String reminderType;
}
