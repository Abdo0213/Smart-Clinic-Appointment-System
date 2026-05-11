package com.clinic.notification.listener;

import com.clinic.notification.dto.ReminderMessage;
import com.clinic.notification.entity.Notification;
import com.clinic.notification.repository.NotificationRepository;
import com.clinic.notification.service.EmailService;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    /**
     * SQS Listener for appointment reminders.
     * Spring Cloud AWS SQS integration automatically handles message polling
     * and deserialization using the @SqsListener annotation.
     */
    @SqsListener("${aws.sqs.queue-name}")
    public void listen(ReminderMessage message) {
        log.info("Received reminder message: {}", message);

        Notification notification = Notification.builder()
                .appointmentId(message.getAppointmentId())
                .userId(String.valueOf(message.getUserId()))
                .email(message.getEmail())
                .title("Appointment Reminder")
                .message("Reminder: You have an appointment in " + message.getReminderType())
                .type("APPOINTMENT_REMINDER_" + message.getReminderType().toUpperCase())
                .reminderType(message.getReminderType())
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build();

        try {
            // 1. Send Email
            emailService.sendReminderEmail(message.getEmail(), message.getReminderType());

            // 2. Mark as Success
            notification.setStatus("SUCCESS");
            log.info("Successfully processed reminder for appointment {}", message.getAppointmentId());
        } catch (Exception e) {
            // 3. Mark as Failure
            notification.setStatus("FAILURE");
            notification.setErrorMessage(e.getMessage());
            log.error("Failed to process reminder for appointment {}", message.getAppointmentId(), e);
        } finally {
            // 4. Save to DB for audit trail
            notificationRepository.save(notification);
        }
    }
}
