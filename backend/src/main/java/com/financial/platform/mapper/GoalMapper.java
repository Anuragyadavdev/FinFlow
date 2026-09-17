package com.financial.platform.mapper;

import com.financial.platform.dto.request.GoalRequest;
import com.financial.platform.dto.response.GoalResponse;
import com.financial.platform.entity.FinancialGoal;
import com.financial.platform.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class GoalMapper {

    public GoalResponse toResponse(FinancialGoal goal) {
        if (goal == null) return null;

        BigDecimal target = goal.getTargetAmount() != null
                ? goal.getTargetAmount() : BigDecimal.ZERO;
        BigDecimal current = goal.getCurrentAmount() != null
                ? goal.getCurrentAmount() : BigDecimal.ZERO;
        BigDecimal remaining = target.subtract(current);

        double progress = 0.0;
        if (target.compareTo(BigDecimal.ZERO) > 0) {
            progress = current
                    .multiply(BigDecimal.valueOf(100))
                    .divide(target, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        BigDecimal monthlyRequired = calculateMonthlyRequired(current, target, goal.getTargetDate());

        boolean behind = goal.getTargetDate() != null
                && goal.getTargetDate().isBefore(LocalDate.now())
                && current.compareTo(target) < 0;

        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .targetAmount(target)
                .currentAmount(current)
                .remainingAmount(remaining)
                .progressPercentage(progress)
                .monthlySavingsRequired(monthlyRequired)
                .targetDate(goal.getTargetDate())
                .startDate(goal.getStartDate())
                .priority(goal.getPriority())
                .status(goal.getStatus())
                .icon(goal.getIcon())
                .color(goal.getColor())
                .isBehindSchedule(behind)
                .build();
    }

    public FinancialGoal toEntity(GoalRequest request, User user) {
        return FinancialGoal.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .targetAmount(request.getTargetAmount())
                .currentAmount(BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .priority(request.getPriority() != null
                        ? request.getPriority() : FinancialGoal.Priority.MEDIUM)
                .status(FinancialGoal.GoalStatus.ACTIVE)
                .icon(request.getIcon())
                .color(request.getColor())
                .build();
    }

    public void updateEntity(FinancialGoal goal, GoalRequest request) {
        goal.setName(request.getName());
        goal.setDescription(request.getDescription());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        if (request.getStartDate() != null) goal.setStartDate(request.getStartDate());
        if (request.getPriority() != null) goal.setPriority(request.getPriority());
        goal.setIcon(request.getIcon());
        goal.setColor(request.getColor());
    }

    private BigDecimal calculateMonthlyRequired(BigDecimal current, BigDecimal target, LocalDate targetDate) {
        if (targetDate == null) return BigDecimal.ZERO;
        long months = ChronoUnit.MONTHS.between(LocalDate.now(), targetDate);
        if (months <= 0) return target.subtract(current);
        BigDecimal remaining = target.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return remaining.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
    }
}