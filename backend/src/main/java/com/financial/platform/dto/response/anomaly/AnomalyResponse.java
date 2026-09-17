package com.financial.platform.dto.response.anomaly;

import com.financial.platform.entity.Anomaly;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyResponse {

    private Long id;
    private Anomaly.AnomalyType anomalyType;
    private Anomaly.Severity severity;
    private String description;

    private BigDecimal expectedValue;
    private BigDecimal actualValue;
    private BigDecimal deviationPercentage;

    private String detectionMethod;

    // Linked transaction
    private Long transactionId;
    private BigDecimal transactionAmount;
    private String transactionDescription;
    private LocalDateTime transactionDate;

    private String categoryName;
    private String accountName;

    private Boolean isReviewed;
    private Boolean isFalsePositive;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    private LocalDateTime createdAt;
}