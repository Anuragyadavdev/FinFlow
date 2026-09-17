package com.financial.platform.dto.response.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockSearchResult {
    private String symbol;
    private String shortName;
    private String longName;
    private String exchange;
    private String type;
}