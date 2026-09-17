package com.financial.platform.service;

import com.financial.platform.entity.Notification;
import org.springframework.data.domain.Page;

public interface NotificationService {
    Page<Notification> getNotifications(int page, int size);
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    Notification create(Long userId, String title, String message,
                        Notification.NotificationType type,
                        Notification.Severity severity);
}