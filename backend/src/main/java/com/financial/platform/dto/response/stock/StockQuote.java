package com.financial.platform.dto.response.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockQuote {

    private String symbol;
    private String shortName;
    private String longName;
    private String currency;
    private String exchange;

    private BigDecimal currentPrice;
    private BigDecimal previousClose;
    private BigDecimal open;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private Long volume;

    private BigDecimal change;
    private Double changePercent;

    private BigDecimal fiftyTwoWeekHigh;
    private BigDecimal fiftyTwoWeekLow;

    private BigDecimal marketCap;
    private BigDecimal peRatio;
}