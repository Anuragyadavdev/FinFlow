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
public class PeriodComparison {
    private String periodLabel;               // e.g. "This Month" vs "Last Month"
    private BigDecimal currentIncome;
    private BigDecimal previousIncome;
    private Double incomeChangePercent;

    private BigDecimal currentExpense;
    private BigDecimal previousExpense;
    private Double expenseChangePercent;

    private BigDecimal currentSavings;
    private BigDecimal previousSavings;
    private Double savingsChangePercent;
}