package com.financial.platform.service;

import com.financial.platform.dto.response.stock.StockChart;
import com.financial.platform.dto.response.stock.StockQuote;
import com.financial.platform.dto.response.stock.StockSearchResult;

import java.util.List;

public interface StockService {
    StockQuote getQuote(String symbol);
    StockChart getChart(String symbol, String range);
    List<StockSearchResult> search(String query);
    List<StockQuote> getGainers();
    List<StockQuote> getLosers();
}