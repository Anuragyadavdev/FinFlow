package com.financial.platform.service.impl;

import com.financial.platform.dto.response.analytics.*;
import com.financial.platform.entity.Transaction;
import com.financial.platform.repository.TransactionRepository;
import com.financial.platform.service.AnalyticsService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummary getCurrentMonthSummary() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.withDayOfMonth(1);
        LocalDate end = today.withDayOfMonth(today.lengthOfMonth());
        return getSummary(start, end);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummary getSummaryForMonths(int monthsBack) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusMonths(monthsBack).withDayOfMonth(1);
        return getSummary(start, end);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummary getSummary(LocalDate startDate, LocalDate endDate) {
        Long userId = SecurityUtils.getCurrentUserId();

        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = endDate.atTime(LocalTime.MAX);

        // ----- Totals -----
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME, startDT, endDT);
        BigDecimal totalExpense = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE, startDT, endDT);
        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        long totalTxns = transactionRepository.countByUserIdAndDateRange(
                userId, startDT, endDT);

        BigDecimal avgTxn = transactionRepository.avgAmountByTypeAndRange(
                userId, Transaction.TransactionType.EXPENSE, startDT, endDT);

        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days <= 0) days = 1;
        BigDecimal avgDailySpend = totalExpense.divide(
                BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);

        // ----- Categories -----
        List<CategorySpending> topExpenses = buildCategoryBreakdown(
                userId, Transaction.TransactionType.EXPENSE, startDT, endDT, totalExpense);
        List<CategorySpending> topIncome = buildCategoryBreakdown(
                userId, Transaction.TransactionType.INCOME, startDT, endDT, totalIncome);

        // ----- Previous period (same length, immediately before) -----
        long periodDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevEnd = startDate.minusDays(1);
        LocalDate prevStart = prevEnd.minusDays(periodDays - 1);

        PeriodComparison comparison = buildPeriodComparison(
                userId, startDate, endDate, prevStart, prevEnd);

        // ----- Category changes -----
        List<CategoryChange> changes = buildCategoryChanges(
                userId, startDT, endDT,
                prevStart.atStartOfDay(), prevEnd.atTime(LocalTime.MAX));

        // ----- Monthly trends (last 6 months including current) -----
        List<TrendPoint> trends = buildMonthlyTrends(userId, 6);

        // ----- Generate insights -----
        List<Insight> insights = generateInsights(
                comparison, changes, topExpenses, savingsRate, totalExpense);

        return AnalyticsSummary.builder()
                .periodLabel(formatPeriod(startDate, endDate))
                .startDate(startDate.toString())
                .endDate(endDate.toString())
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .savingsRate(savingsRate)
                .averageDailySpend(avgDailySpend)
                .averageTransactionAmount(avgTxn)
                .totalTransactions(totalTxns)
                .topExpenseCategories(topExpenses)
                .topIncomeCategories(topIncome)
                .periodComparison(comparison)
                .categoryChanges(changes)
                .monthlyTrends(trends)
                .insights(insights)
                .build();
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private List<CategorySpending> buildCategoryBreakdown(
            Long userId, Transaction.TransactionType type,
            LocalDateTime start, LocalDateTime end, BigDecimal total) {

        List<Object[]> rows = transactionRepository.getCategoryBreakdown(
                userId, type, start, end);

        List<CategorySpending> list = new ArrayList<>();
        for (Object[] row : rows) {
            Long catId = row[0] != null ? ((Number) row[0]).longValue() : null;
            String name = row[1] != null ? (String) row[1] : "Uncategorized";
            String icon = row[2] != null ? (String) row[2] : "📦";
            BigDecimal amount = (BigDecimal) row[3];
            long count = ((Number) row[4]).longValue();

            double pct = 0.0;
            if (total != null && total.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.multiply(BigDecimal.valueOf(100))
                        .divide(total, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            list.add(CategorySpending.builder()
                    .categoryId(catId)
                    .categoryName(name)
                    .categoryIcon(icon)
                    .amount(amount)
                    .percentage(pct)
                    .transactionCount(count)
                    .build());
        }
        return list;
    }

    private PeriodComparison buildPeriodComparison(
            Long userId,
            LocalDate curStart, LocalDate curEnd,
            LocalDate prevStart, LocalDate prevEnd) {

        BigDecimal curIncome = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME,
                curStart.atStartOfDay(), curEnd.atTime(LocalTime.MAX));
        BigDecimal prevIncome = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME,
                prevStart.atStartOfDay(), prevEnd.atTime(LocalTime.MAX));

        BigDecimal curExpense = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE,
                curStart.atStartOfDay(), curEnd.atTime(LocalTime.MAX));
        BigDecimal prevExpense = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE,
                prevStart.atStartOfDay(), prevEnd.atTime(LocalTime.MAX));

        BigDecimal curSavings = curIncome.subtract(curExpense);
        BigDecimal prevSavings = prevIncome.subtract(prevExpense);

        return PeriodComparison.builder()
                .periodLabel(formatPeriod(curStart, curEnd) + " vs " +
                             formatPeriod(prevStart, prevEnd))
                .currentIncome(curIncome)
                .previousIncome(prevIncome)
                .incomeChangePercent(percentChange(prevIncome, curIncome))
                .currentExpense(curExpense)
                .previousExpense(prevExpense)
                .expenseChangePercent(percentChange(prevExpense, curExpense))
                .currentSavings(curSavings)
                .previousSavings(prevSavings)
                .savingsChangePercent(percentChange(prevSavings, curSavings))
                .build();
    }

    private List<CategoryChange> buildCategoryChanges(
            Long userId,
            LocalDateTime curStart, LocalDateTime curEnd,
            LocalDateTime prevStart, LocalDateTime prevEnd) {

        Map<Long, BigDecimal> prevMap = new HashMap<>();
        for (Object[] row : transactionRepository.getExpenseByCategoryForRange(
                userId, prevStart, prevEnd)) {
            Long catId = row[0] != null ? ((Number) row[0]).longValue() : null;
            if (catId != null) prevMap.put(catId, (BigDecimal) row[3]);
        }

        List<CategoryChange> changes = new ArrayList<>();
        for (Object[] row : transactionRepository.getExpenseByCategoryForRange(
                userId, curStart, curEnd)) {

            Long catId = row[0] != null ? ((Number) row[0]).longValue() : null;
            String name = row[1] != null ? (String) row[1] : "Uncategorized";
            String icon = row[2] != null ? (String) row[2] : "📦";
            BigDecimal cur = (BigDecimal) row[3];
            BigDecimal prev = catId != null
                    ? prevMap.getOrDefault(catId, BigDecimal.ZERO)
                    : BigDecimal.ZERO;

            BigDecimal diff = cur.subtract(prev);
            Double pct = percentChange(prev, cur);

            String direction = "STABLE";
            if (pct != null) {
                if (pct > 5) direction = "INCREASED";
                else if (pct < -5) direction = "DECREASED";
            }

            changes.add(CategoryChange.builder()
                    .categoryId(catId)
                    .categoryName(name)
                    .categoryIcon(icon)
                    .currentAmount(cur)
                    .previousAmount(prev)
                    .changeAmount(diff)
                    .changePercent(pct)
                    .direction(direction)
                    .build());
        }

        // sort by absolute change amount desc
        changes.sort((a, b) ->
                b.getChangeAmount().abs().compareTo(a.getChangeAmount().abs()));
        return changes;
    }

    private List<TrendPoint> buildMonthlyTrends(Long userId, int monthsBack) {
        LocalDate start = LocalDate.now().minusMonths(monthsBack - 1).withDayOfMonth(1);

        List<Object[]> rows = transactionRepository.getMonthlyTrends(
                userId, start.atStartOfDay());

        Map<String, TrendPoint> map = new LinkedHashMap<>();
        LocalDate cursor = start;
        for (int i = 0; i < monthsBack; i++) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            map.put(key, TrendPoint.builder()
                    .year(cursor.getYear())
                    .month(cursor.getMonthValue())
                    .monthLabel(cursor.getMonth()
                            .getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .income(BigDecimal.ZERO)
                    .expense(BigDecimal.ZERO)
                    .savings(BigDecimal.ZERO)
                    .savingsRate(0.0)
                    .build());
            cursor = cursor.plusMonths(1);
        }

        for (Object[] row : rows) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            Transaction.TransactionType type = (Transaction.TransactionType) row[2];
            BigDecimal amount = (BigDecimal) row[3];

            TrendPoint t = map.get(year + "-" + month);
            if (t == null) continue;

            if (type == Transaction.TransactionType.INCOME) t.setIncome(amount);
            else if (type == Transaction.TransactionType.EXPENSE) t.setExpense(amount);

            BigDecimal inc = t.getIncome();
            BigDecimal exp = t.getExpense();
            BigDecimal sav = inc.subtract(exp);
            t.setSavings(sav);

            if (inc.compareTo(BigDecimal.ZERO) > 0) {
                t.setSavingsRate(sav.multiply(BigDecimal.valueOf(100))
                        .divide(inc, 2, RoundingMode.HALF_UP)
                        .doubleValue());
            }
        }

        return new ArrayList<>(map.values());
    }

    // ----- Insight Generation (rules, not AI) -----

    private List<Insight> generateInsights(
            PeriodComparison cmp,
            List<CategoryChange> changes,
            List<CategorySpending> topExpenses,
            double savingsRate,
            BigDecimal totalExpense) {

        List<Insight> insights = new ArrayList<>();

        // 1. Overall expense change
        if (cmp.getExpenseChangePercent() != null) {
            double pct = cmp.getExpenseChangePercent();
            if (pct > 10) {
                insights.add(Insight.builder()
                        .type("WARNING").severity("HIGH")
                        .title("Expenses Increased")
                        .message(String.format(
                                "Your expenses increased by %.1f%% compared to the previous period.",
                                pct))
                        .value(cmp.getCurrentExpense())
                        .changePercent(pct)
                        .build());
            } else if (pct < -10) {
                insights.add(Insight.builder()
                        .type("POSITIVE").severity("LOW")
                        .title("Expenses Decreased")
                        .message(String.format(
                                "Great job! Your expenses decreased by %.1f%% compared to the previous period.",
                                Math.abs(pct)))
                        .value(cmp.getCurrentExpense())
                        .changePercent(pct)
                        .build());
            }
        }

        // 2. Savings rate
        if (savingsRate >= 30) {
            insights.add(Insight.builder()
                    .type("POSITIVE").severity("LOW")
                    .title("Excellent Savings Rate")
                    .message(String.format(
                            "You're saving %.1f%% of your income — well above the recommended 20%%.",
                            savingsRate))
                    .build());
        } else if (savingsRate > 0 && savingsRate < 10) {
            insights.add(Insight.builder()
                    .type("WARNING").severity("MEDIUM")
                    .title("Low Savings Rate")
                    .message(String.format(
                            "Your savings rate is only %.1f%%. Consider reducing discretionary spending.",
                            savingsRate))
                    .build());
        } else if (savingsRate < 0) {
            insights.add(Insight.builder()
                    .type("WARNING").severity("HIGH")
                    .title("Spending Exceeds Income")
                    .message("You're spending more than you earn this period. Review your expenses urgently.")
                    .build());
        }

        // 3. Top increasing category
        changes.stream()
                .filter(c -> "INCREASED".equals(c.getDirection()))
                .findFirst()
                .ifPresent(c -> insights.add(Insight.builder()
                        .type("TREND").severity("MEDIUM")
                        .title(c.getCategoryName() + " Spending Up")
                        .message(String.format(
                                "%s increased by %.1f%% compared to the previous period.",
                                c.getCategoryName(),
                                c.getChangePercent()))
                        .value(c.getCurrentAmount())
                        .changePercent(c.getChangePercent())
                        .category(c.getCategoryName())
                        .build()));

        // 4. Top category concentration
        if (!topExpenses.isEmpty()) {
            CategorySpending top = topExpenses.get(0);
            if (top.getPercentage() != null && top.getPercentage() > 30) {
                insights.add(Insight.builder()
                        .type("INFO").severity("MEDIUM")
                        .title("High Concentration in " + top.getCategoryName())
                        .message(String.format(
                                "%s accounts for %.1f%% of your total expenses (₹%,.2f).",
                                top.getCategoryName(),
                                top.getPercentage(),
                                top.getAmount()))
                        .category(top.getCategoryName())
                        .value(top.getAmount())
                        .build());
            }
        }

        // 5. Top 3 concentration
        if (topExpenses.size() >= 3) {
            double top3Pct = topExpenses.stream().limit(3)
                    .mapToDouble(c -> c.getPercentage() != null ? c.getPercentage() : 0)
                    .sum();
            if (top3Pct > 70) {
                insights.add(Insight.builder()
                        .type("INFO").severity("LOW")
                        .title("Top 3 Categories Dominate")
                        .message(String.format(
                                "Your top 3 categories account for %.1f%% of total spending.",
                                top3Pct))
                        .build());
            }
        }

        return insights;
    }

    private Double percentChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || current == null) return null;
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) == 0 ? 0.0 : 100.0;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous.abs(), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String formatPeriod(LocalDate start, LocalDate end) {
        return start.toString() + " to " + end.toString();
    }
}