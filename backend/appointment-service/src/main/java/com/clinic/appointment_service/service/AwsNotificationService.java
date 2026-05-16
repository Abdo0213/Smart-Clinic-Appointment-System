package com.clinic.appointment_service.service;

import com.clinic.appointment_service.entity.Appointment;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

//@Service
//@RequiredArgsConstructor
public class AwsNotificationService {
    private SnsClient snsClient;
    private ObjectMapper objectMapper;

    @Value("${aws.sns.topic.appointment-booked:arn:aws:sns:us-east-1:123456789012:appointment-booked}")
    private String topicArn;

    public void publishAppointmentBooked(Appointment appointment, String patientEmail, UUID userId, String doctorName) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("appointmentId", appointment.getId());
            event.put("patientId", appointment.getPatientId());
            event.put("userId", userId != null ? userId.toString() : null);
            event.put("patientEmail", patientEmail);
            event.put("slotDate", appointment.getSlotDate().toString());
            event.put("slotStart", appointment.getSlotStart().toString());
            event.put("doctorName", doctorName);

            String message = objectMapper.writeValueAsString(event);

            PublishRequest request = PublishRequest.builder()
                    .topicArn(topicArn)
                    .message(message)
                    .build();

            snsClient.publish(request);
            System.out.println("Published appointment booked event to SNS for appointment: " + appointment.getId());
        } catch (Exception e) {
            System.err.println("Failed to publish SNS event: " + e.getMessage());
        }
    }
}
