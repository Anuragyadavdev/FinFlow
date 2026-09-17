package com.financial.platform.dto.response;

import com.financial.platform.entity.Investment;
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
public class InvestmentResponse {

    private Long id;
    private String stockSymbol;
    private String companyName;
    private Investment.InvestmentType investmentType;
    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private Integer quantity;
    private BigDecimal currentPrice;
    private BigDecimal investedAmount;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private Double profitLossPercentage;
    private String sector;
    private Boolean isActive;
    private LocalDate lastPriceUpdate;
    private String notes;
}