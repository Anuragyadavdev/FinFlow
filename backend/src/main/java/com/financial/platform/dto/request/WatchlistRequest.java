package com.financial.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WatchlistRequest {

    @NotBlank(message = "Stock symbol is required")
    private String stockSymbol;

    private String companyName;

    private BigDecimal targetPrice;

    private String notes;

    private Boolean alertEnabled = false;
}