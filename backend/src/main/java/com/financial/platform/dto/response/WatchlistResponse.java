package com.financial.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistResponse {

    private Long id;
    private String stockSymbol;
    private String companyName;
    private BigDecimal targetPrice;
    private String notes;
    private Boolean alertEnabled;

    // Live data
    private BigDecimal currentPrice;
    private BigDecimal change;
    private Double changePercent;
}