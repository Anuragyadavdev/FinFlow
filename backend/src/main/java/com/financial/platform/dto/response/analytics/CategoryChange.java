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
public class CategoryChange {
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal currentAmount;
    private BigDecimal previousAmount;
    private BigDecimal changeAmount;
    private Double changePercent;
    private String direction;      // INCREASED / DECREASED / STABLE
}