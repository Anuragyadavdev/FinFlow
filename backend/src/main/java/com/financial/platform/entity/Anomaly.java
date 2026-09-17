package com.financial.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "anomalies")
public class Anomaly extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Column(name = "anomaly_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AnomalyType anomalyType;

    @Column(name = "severity", nullable = false)
    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "expected_value", precision = 19, scale = 2)
    private BigDecimal expectedValue;

    @Column(name = "actual_value", precision = 19, scale = 2)
    private BigDecimal actualValue;

    @Column(name = "deviation_percentage", precision = 10, scale = 2)
    private BigDecimal deviationPercentage;

    @Column(name = "detection_method", length = 50)
    private String detectionMethod;

    @Column(name = "is_reviewed")
    private Boolean isReviewed = false;

    @Column(name = "is_false_positive")
    private Boolean isFalsePositive = false;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", length = 500)
    private String reviewNotes;

    public enum AnomalyType {
        UNUSUAL_AMOUNT,
        UNUSUAL_FREQUENCY,
        DUPLICATE_TRANSACTION,
        CATEGORY_SPIKE,
        UNUSUAL_MERCHANT,
        UNUSUAL_TIME,
        UNUSUAL_LOCATION
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}