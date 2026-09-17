package com.financial.platform.dto.request.ai;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdviceRequest {

    @NotNull(message = "Investment amount is required")
    @DecimalMin(value = "1000", message = "Minimum amount is ₹1,000")
    private BigDecimal amount;

    @NotBlank(message = "Question is required")
    private String question;

    /** Optional: LOW / MODERATE / HIGH — overrides user preference */
    private String riskTolerance;

    /** Optional: SHORT / MEDIUM / LONG */
    private String timeHorizon;
}