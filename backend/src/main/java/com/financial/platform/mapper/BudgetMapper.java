package com.financial.platform.mapper;

import com.financial.platform.dto.request.BudgetRequest;
import com.financial.platform.dto.response.BudgetResponse;
import com.financial.platform.entity.Budget;
import com.financial.platform.entity.Category;
import com.financial.platform.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class BudgetMapper {

    public BudgetResponse toResponse(Budget budget) {
        if (budget == null) return null;

        BigDecimal allocated = budget.getAllocatedAmount() != null
                ? budget.getAllocatedAmount() : BigDecimal.ZERO;
        BigDecimal spent = budget.getSpentAmount() != null
                ? budget.getSpentAmount() : BigDecimal.ZERO;

        BigDecimal remaining = allocated.subtract(spent);

        double percentageUsed = 0.0;
        if (allocated.compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = spent
                    .multiply(BigDecimal.valueOf(100))
                    .divide(allocated, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        BudgetResponse.BudgetResponseBuilder builder = BudgetResponse.builder()
                .id(budget.getId())
                .allocatedAmount(allocated)
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentageUsed(percentageUsed)
                .periodType(budget.getPeriodType())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .alertThreshold(budget.getAlertThreshold())
                .isActive(budget.getIsActive())
                .isExceeded(spent.compareTo(allocated) > 0)
                .notes(budget.getNotes());

        if (budget.getCategory() != null) {
            builder.categoryId(budget.getCategory().getId())
                   .categoryName(budget.getCategory().getName())
                   .categoryIcon(budget.getCategory().getIcon());
        }

        return builder.build();
    }

    public Budget toEntity(BudgetRequest request, User user, Category category) {
        return Budget.builder()
                .user(user)
                .category(category)
                .allocatedAmount(request.getAllocatedAmount())
                .spentAmount(BigDecimal.ZERO)
                .periodType(request.getPeriodType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .alertThreshold(request.getAlertThreshold() != null
                        ? request.getAlertThreshold() : 80)
                .notes(request.getNotes())
                .isActive(true)
                .build();
    }

    public void updateEntity(Budget budget, BudgetRequest request, Category category) {
        budget.setCategory(category);
        budget.setAllocatedAmount(request.getAllocatedAmount());
        budget.setPeriodType(request.getPeriodType());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        if (request.getAlertThreshold() != null) {
            budget.setAlertThreshold(request.getAlertThreshold());
        }
        budget.setNotes(request.getNotes());
    }
}