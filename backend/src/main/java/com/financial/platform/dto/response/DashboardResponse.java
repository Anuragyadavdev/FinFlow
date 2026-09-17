package com.financial.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlySavings;
    private Double savingsRate;

    private Map<String, BigDecimal> categorySpending;
    private List<MonthlyTrend> monthlyTrends;
    private List<BudgetResponse> activeBudgets;
    private List<GoalResponse> activeGoals;
    private List<TransactionResponse> recentTransactions;
    private Long unreadNotifications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private int year;
        private int month;
        private String monthName;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal savings;
    }
}