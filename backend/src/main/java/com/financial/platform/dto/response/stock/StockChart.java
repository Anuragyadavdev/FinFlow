package com.financial.platform.dto.response.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockChart {
    private String symbol;
    private String range;         // 1d, 1w, 1mo, 3mo, 1y
    private String interval;      // 5m, 1h, 1d
    private List<StockChartPoint> points;
}