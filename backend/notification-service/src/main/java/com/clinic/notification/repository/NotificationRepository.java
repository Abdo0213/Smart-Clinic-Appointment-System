package com.clinic.notification.repository;

import com.clinic.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    Page<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, boolean isRead, Pageable pageable);
    
    long countByUserIdAndIsRead(String userId, boolean isRead);
}
