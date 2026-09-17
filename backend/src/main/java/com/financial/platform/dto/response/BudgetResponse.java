package com.financial.platform.dto.response;

import com.financial.platform.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private Budget.PeriodType periodType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer alertThreshold;
    private Boolean isActive;
    private Boolean isExceeded;
    private String notes;
}