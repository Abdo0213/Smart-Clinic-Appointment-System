package com.clinic.notification.service;

import com.clinic.notification.entity.Notification;
import com.clinic.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;
    private final JavaMailSender mailSender;

    public Page<Notification> getNotifications(String userId, Boolean unreadOnly, Pageable pageable) {
        if (unreadOnly != null && unreadOnly) {
            return repository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, pageable);
        }
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(String userId) {
        return repository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public void markAsRead(String id) {
        try {
            Long longId = Long.parseLong(id);
            repository.findById(longId).ifPresent(n -> {
                n.setRead(true);
                repository.save(n);
            });
        } catch (NumberFormatException e) {
            // Log or ignore invalid ID formats
        }
    }

    @Transactional
    public void markAllAsRead(String userId) {
        // Simple implementation for demo; in production use a bulk update query
        repository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, Pageable.unpaged())
                .forEach(n -> {
                    n.setRead(true);
                    repository.save(n);
                });
    }

    @Transactional
    public Notification createNotification(String userId, String email, String title, String message, String type) {
        // 1. Create DB record
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = repository.save(notification);

        // 2. Send Email
        if (email != null && !email.isBlank()) {
            sendEmail(email, title, message);
        }

        return saved;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@smartclinic.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
