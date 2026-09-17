package com.financial.platform.controller;

import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.stock.StockChart;
import com.financial.platform.dto.response.stock.StockQuote;
import com.financial.platform.dto.response.stock.StockSearchResult;
import com.financial.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/quote/{symbol}")
    public ResponseEntity<ApiResponse<StockQuote>> quote(@PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getQuote(symbol)));
    }

    @GetMapping("/chart/{symbol}")
    public ResponseEntity<ApiResponse<StockChart>> chart(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1mo") String range) {
        return ResponseEntity.ok(ApiResponse.success(
                stockService.getChart(symbol, range)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<StockSearchResult>>> search(
            @RequestParam("q") String query) {
        return ResponseEntity.ok(ApiResponse.success(stockService.search(query)));
    }

    @GetMapping("/gainers")
    public ResponseEntity<ApiResponse<List<StockQuote>>> gainers() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getGainers()));
    }

    @GetMapping("/losers")
    public ResponseEntity<ApiResponse<List<StockQuote>>> losers() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getLosers()));
    }
}