package com.financial.platform.service;

import com.financial.platform.dto.response.anomaly.AnomalyResponse;
import org.springframework.data.domain.Page;

public interface AnomalyService {

    Page<AnomalyResponse> listAnomalies(int page, int size);

    AnomalyResponse getAnomaly(Long id);

    AnomalyResponse review(Long id, Boolean isFalsePositive, String notes);

    long countUnreviewed();

    /** Runs detection across recent activity and creates Anomaly rows. */
    int runDetectionForCurrentUser();
}