package com.financial.platform.mapper;

import com.financial.platform.dto.response.anomaly.AnomalyResponse;
import com.financial.platform.entity.Anomaly;
import com.financial.platform.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class AnomalyMapper {

    public AnomalyResponse toResponse(Anomaly a) {
        if (a == null) return null;

        AnomalyResponse.AnomalyResponseBuilder b = AnomalyResponse.builder()
                .id(a.getId())
                .anomalyType(a.getAnomalyType())
                .severity(a.getSeverity())
                .description(a.getDescription())
                .expectedValue(a.getExpectedValue())
                .actualValue(a.getActualValue())
                .deviationPercentage(a.getDeviationPercentage())
                .detectionMethod(a.getDetectionMethod())
                .isReviewed(a.getIsReviewed())
                .isFalsePositive(a.getIsFalsePositive())
                .reviewedAt(a.getReviewedAt())
                .reviewNotes(a.getReviewNotes())
                .createdAt(a.getCreatedAt());

        Transaction t = a.getTransaction();
        if (t != null) {
            b.transactionId(t.getId())
             .transactionAmount(t.getAmount())
             .transactionDescription(t.getDescription())
             .transactionDate(t.getTransactionDate());

            if (t.getCategory() != null) {
                b.categoryName(t.getCategory().getName());
            }
            if (t.getAccount() != null) {
                b.accountName(t.getAccount().getName());
            }
        }

        return b.build();
    }
}