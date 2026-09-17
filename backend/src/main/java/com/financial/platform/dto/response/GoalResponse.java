package com.financial.platform.dto.response;

import com.financial.platform.entity.FinancialGoal;
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
public class GoalResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private Double progressPercentage;
    private BigDecimal monthlySavingsRequired;
    private LocalDate targetDate;
    private LocalDate startDate;
    private FinancialGoal.Priority priority;
    private FinancialGoal.GoalStatus status;
    private String icon;
    private String color;
    private Boolean isBehindSchedule;
}