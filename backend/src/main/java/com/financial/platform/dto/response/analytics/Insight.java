package com.financial.platform.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Insight {
    private String type;          // TREND / WARNING / POSITIVE / INFO
    private String severity;      // LOW / MEDIUM / HIGH
    private String title;
    private String message;
    private BigDecimal value;
    private Double changePercent;
    private String category;      // optional
}