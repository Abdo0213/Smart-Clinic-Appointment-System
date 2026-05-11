package com.clinic.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendReminderEmail(String to, String reminderType) {
        log.info("Sending {} reminder email to {}", reminderType, to);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Appointment Reminder - Smart Clinic");
        
        String body = String.format(
            "Hello,\n\nThis is a friendly reminder that you have an appointment scheduled in %s.\n" +
            "We look forward to seeing you!\n\nBest regards,\nSmart Clinic Team",
            reminderType.equals("24h") ? "24 hours" : "2 hours"
        );
        
        message.setText(body);
        mailSender.send(message);
        log.info("Email sent successfully to {}", to);
    }
}
