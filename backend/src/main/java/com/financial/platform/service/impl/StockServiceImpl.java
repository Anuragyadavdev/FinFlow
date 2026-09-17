package com.financial.platform.service.impl;

import com.financial.platform.dto.response.stock.StockChart;
import com.financial.platform.dto.response.stock.StockQuote;
import com.financial.platform.dto.response.stock.StockSearchResult;
import com.financial.platform.integration.YahooFinanceClient;
import com.financial.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final YahooFinanceClient yahoo;

    /** Nifty 50 top constituents — used for gainers/losers */
    private static final List<String> NIFTY50 = List.of(
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
            "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
            "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "BAJFINANCE.NS",
            "HCLTECH.NS", "SUNPHARMA.NS", "TITAN.NS", "WIPRO.NS", "ULTRACEMCO.NS",
            "NESTLEIND.NS", "TATAMOTORS.NS", "TATASTEEL.NS", "POWERGRID.NS", "NTPC.NS",
            "M&M.NS", "TECHM.NS", "ADANIENT.NS", "JSWSTEEL.NS", "GRASIM.NS"
    );

    @Override
    public StockQuote getQuote(String symbol) {
        return yahoo.getQuote(normalizeSymbol(symbol));
    }

    @Override
    public StockChart getChart(String symbol, String range) {
        return yahoo.getChart(normalizeSymbol(symbol), range);
    }

    @Override
    public List<StockSearchResult> search(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        return yahoo.search(query.trim());
    }

    @Override
    public List<StockQuote> getGainers() {
        List<StockQuote> all = fetchBatch();
        all.sort(Comparator.comparing(
                StockQuote::getChangePercent,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return all.stream().limit(10).toList();
    }

    @Override
    public List<StockQuote> getLosers() {
        List<StockQuote> all = fetchBatch();
        all.sort(Comparator.comparing(
                StockQuote::getChangePercent,
                Comparator.nullsLast(Comparator.naturalOrder())));
        return all.stream().limit(10).toList();
    }

    private List<StockQuote> fetchBatch() {
        List<StockQuote> list = new ArrayList<>();
        for (String sym : NIFTY50) {
            StockQuote q = yahoo.getQuote(sym);
            if (q != null && q.getChangePercent() != null) {
                list.add(q);
            }
        }
        return list;
    }

    /** If the user passes "RELIANCE", auto-append .NS (NSE) */
    private String normalizeSymbol(String symbol) {
        if (symbol == null) return null;
        String s = symbol.trim().toUpperCase();
        if (s.contains(".")) return s;
        return s + ".NS";
    }
}