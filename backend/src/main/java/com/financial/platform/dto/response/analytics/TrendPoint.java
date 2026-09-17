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
public class TrendPoint {
    private int year;
    private int month;
    private String monthLabel;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;
    private Double savingsRate;
}