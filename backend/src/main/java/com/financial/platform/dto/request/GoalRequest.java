package com.financial.platform.dto.request;

import com.financial.platform.entity.FinancialGoal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalRequest {

    @NotBlank(message = "Goal name is required")
    @Size(max = 200)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.00")
    private BigDecimal targetAmount;

    private LocalDate targetDate;

    private LocalDate startDate;

    private FinancialGoal.Priority priority;

    @Size(max = 50)
    private String icon;

    @Size(max = 20)
    private String color;
}