package com.financial.platform.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummary {

    // Period
    private String periodLabel;
    private String startDate;
    private String endDate;

    // Totals
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private Double savingsRate;

    // Averages
    private BigDecimal averageDailySpend;
    private BigDecimal averageTransactionAmount;
    private Long totalTransactions;

    // Top categories
    private List<CategorySpending> topExpenseCategories;
    private List<CategorySpending> topIncomeCategories;

    // Comparison with previous period
    private PeriodComparison periodComparison;

    // Category-wise change
    private List<CategoryChange> categoryChanges;

    // Monthly trends
    private List<TrendPoint> monthlyTrends;

    // Human-readable insights
    private List<Insight> insights;
}