package com.financial.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "severity")
    @Enumerated(EnumType.STRING)
    private Severity severity = Severity.INFO;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    public enum NotificationType {
        BUDGET_ALERT,
        BUDGET_EXCEEDED,
        ANOMALY_DETECTED,
        GOAL_PROGRESS,
        GOAL_BEHIND,
        RECURRING_PAYMENT,
        INVESTMENT_ALERT,
        SYSTEM,
        WELCOME
    }

    public enum Severity {
        INFO,
        WARNING,
        CRITICAL
    }
}