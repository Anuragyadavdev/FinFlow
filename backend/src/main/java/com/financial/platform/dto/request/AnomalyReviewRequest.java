package com.financial.platform.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnomalyReviewRequest {

    @NotNull(message = "isFalsePositive is required")
    private Boolean isFalsePositive;

    private String reviewNotes;
}