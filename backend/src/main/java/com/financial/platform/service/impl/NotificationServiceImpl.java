package com.financial.platform.service.impl;

import com.financial.platform.entity.Notification;
import com.financial.platform.entity.User;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.repository.NotificationRepository;
import com.financial.platform.repository.UserRepository;
import com.financial.platform.service.NotificationService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByUserIdAndIsDeletedFalse(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository
                .countByUserIdAndIsReadFalseAndIsDeletedFalse(
                        SecurityUtils.getCurrentUserId());
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Notification n = notificationRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead(SecurityUtils.getCurrentUserId());
    }

    @Override
    @Transactional
    public Notification create(Long userId, String title, String message,
                               Notification.NotificationType type,
                               Notification.Severity severity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .severity(severity != null ? severity : Notification.Severity.INFO)
                .isRead(false)
                .build();
        return notificationRepository.save(n);
    }
}