package com.clinic.notification.controller;

import com.clinic.notification.entity.Notification;
import com.clinic.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false) Boolean unreadOnly,
            Pageable pageable) {
        return ResponseEntity.ok(service.getNotifications(userId, unreadOnly, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(Map.of("count", service.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        service.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@RequestHeader("X-User-Id") String userId) {
        service.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Callback endpoint for AWS SNS / EventBridge
     */
    @PostMapping("/callback")
    public ResponseEntity<Notification> handleAwsCallback(@RequestBody Map<String, String> payload) {
        // Expected payload keys: userId, email, title, message, type
        String userId = payload.get("userId");
        String email = payload.get("email");
        String title = payload.getOrDefault("title", "Clinic Reminder");
        String message = payload.get("message");
        String type = payload.getOrDefault("type", "APPOINTMENT_REMINDER_24H");

        Notification n = service.createNotification(userId, email, title, message, type);
        return ResponseEntity.ok(n);
    }
}
