package com.clinic.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Support both String and numeric IDs if necessary, 
    // but the service expects String for userId.
    private String userId;
    
    private String email;
    private String title;
    private String message;
    private String type; // e.g., APPOINTMENT_REMINDER, SYSTEM, etc.
    
    private boolean isRead;
    
    // Appointment specific fields
    private UUID appointmentId;
    private String reminderType; // 24h or 2h
    private String status; // SUCCESS or FAILURE
    private String errorMessage;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    private LocalDateTime sentAt;
}
