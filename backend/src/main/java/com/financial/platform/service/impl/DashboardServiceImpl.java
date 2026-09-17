package com.financial.platform.service.impl;

import com.financial.platform.dto.response.BudgetResponse;
import com.financial.platform.dto.response.DashboardResponse;
import com.financial.platform.dto.response.GoalResponse;
import com.financial.platform.dto.response.TransactionResponse;
import com.financial.platform.entity.Transaction;
import com.financial.platform.mapper.BudgetMapper;
import com.financial.platform.mapper.GoalMapper;
import com.financial.platform.mapper.TransactionMapper;
import com.financial.platform.repository.*;
import com.financial.platform.service.BudgetService;
import com.financial.platform.service.DashboardService;
import com.financial.platform.service.GoalService;
import com.financial.platform.service.TransactionService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;
    private final BudgetMapper budgetMapper;
    private final GoalMapper goalMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = today.withDayOfMonth(today.lengthOfMonth())
                .atTime(LocalTime.MAX);

        BigDecimal totalBalance = accountRepository.getTotalBalanceByUserId(userId);

        BigDecimal monthlyIncome = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME, monthStart, monthEnd);

        BigDecimal monthlyExpenses = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE, monthStart, monthEnd);

        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);

        double savingsRate = 0.0;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = monthlySavings
                    .multiply(BigDecimal.valueOf(100))
                    .divide(monthlyIncome, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Category spending map
        Map<String, BigDecimal> categorySpending = new HashMap<>();
        transactionRepository.getCategoryWiseSpending(userId, monthStart, monthEnd)
                .forEach(row -> categorySpending.put(
                        (String) row[1], (BigDecimal) row[2]));

        // Monthly trends (last 6 months)
        List<DashboardResponse.MonthlyTrend> trends = buildMonthlyTrends(userId, 6);

        // Budgets & goals
        List<BudgetResponse> budgets = budgetService.getActiveBudgets();
        List<GoalResponse> goals = goalService.getAllGoals();

        // Recent transactions
        List<TransactionResponse> recent = transactionService.getRecentTransactions(10);

        // Unread notifications
        long unread = notificationRepository
                .countByUserIdAndIsReadFalseAndIsDeletedFalse(userId);

        return DashboardResponse.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpenses(monthlyExpenses)
                .monthlySavings(monthlySavings)
                .savingsRate(savingsRate)
                .categorySpending(categorySpending)
                .monthlyTrends(trends)
                .activeBudgets(budgets)
                .activeGoals(goals)
                .recentTransactions(recent)
                .unreadNotifications(unread)
                .build();
    }

    private List<DashboardResponse.MonthlyTrend> buildMonthlyTrends(Long userId, int months) {
        LocalDate start = LocalDate.now().minusMonths(months - 1).withDayOfMonth(1);
        List<Object[]> rows = transactionRepository.getMonthlyTrends(
                userId, start.atStartOfDay());

        Map<String, DashboardResponse.MonthlyTrend> map = new LinkedHashMap<>();
        LocalDate cursor = start;
        for (int i = 0; i < months; i++) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            map.put(key, DashboardResponse.MonthlyTrend.builder()
                    .year(cursor.getYear())
                    .month(cursor.getMonthValue())
                    .monthName(cursor.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .income(BigDecimal.ZERO)
                    .expenses(BigDecimal.ZERO)
                    .savings(BigDecimal.ZERO)
                    .build());
            cursor = cursor.plusMonths(1);
        }

        for (Object[] row : rows) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            Transaction.TransactionType type = (Transaction.TransactionType) row[2];
            BigDecimal amount = (BigDecimal) row[3];

            String key = year + "-" + month;
            DashboardResponse.MonthlyTrend t = map.get(key);
            if (t == null) continue;

            if (type == Transaction.TransactionType.INCOME) {
                t.setIncome(amount);
            } else if (type == Transaction.TransactionType.EXPENSE) {
                t.setExpenses(amount);
            }
            t.setSavings(t.getIncome().subtract(t.getExpenses()));
        }

        return new ArrayList<>(map.values());
    }
}