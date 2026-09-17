package com.financial.platform.dto.request;

import com.financial.platform.entity.Investment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvestmentRequest {

    private String stockSymbol;

    private String companyName;

    @NotNull(message = "Investment type is required")
    private Investment.InvestmentType investmentType;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.01")
    private BigDecimal purchasePrice;

    @NotNull(message = "Quantity is required")
    @Min(value = 1)
    private Integer quantity;

    private BigDecimal currentPrice;

    private String sector;

    private String notes;
}