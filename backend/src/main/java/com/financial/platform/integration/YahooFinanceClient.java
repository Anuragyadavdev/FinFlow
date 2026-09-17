package com.financial.platform.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financial.platform.dto.response.stock.StockChart;
import com.financial.platform.dto.response.stock.StockChartPoint;
import com.financial.platform.dto.response.stock.StockQuote;
import com.financial.platform.dto.response.stock.StockSearchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class YahooFinanceClient {

    @Value("${yahoo.finance.base-url}")
    private String baseUrl;

    @Value("${yahoo.finance.chart-url}")
    private String chartUrl;

    @Value("${yahoo.finance.search-url}")
    private String searchUrl;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ----------------------------------------------------------
    // QUOTE
    // ----------------------------------------------------------
    @Cacheable(value = "stockQuotes", key = "#symbol")
    public StockQuote getQuote(String symbol) {
        try {
            String url = baseUrl + "/v8/finance/chart/" + symbol
                    + "?interval=1d&range=1d";

            String raw = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(raw);
            JsonNode result = root.path("chart").path("result").get(0);
            if (result == null || result.isMissingNode()) {
                log.warn("No data returned for {}", symbol);
                return null;
            }

            JsonNode meta = result.path("meta");

            BigDecimal current = decimalOrNull(meta, "regularMarketPrice");
            BigDecimal prevClose = decimalOrNull(meta, "chartPreviousClose");
            BigDecimal change = BigDecimal.ZERO;
            Double changePct = 0.0;

            if (current != null && prevClose != null && prevClose.signum() != 0) {
                change = current.subtract(prevClose);
                changePct = change
                        .multiply(BigDecimal.valueOf(100))
                        .divide(prevClose, 2, java.math.RoundingMode.HALF_UP)
                        .doubleValue();
            }

            return StockQuote.builder()
                    .symbol(meta.path("symbol").asText(symbol))
                    .shortName(meta.path("shortName").asText(null))
                    .longName(meta.path("longName").asText(null))
                    .currency(meta.path("currency").asText("INR"))
                    .exchange(meta.path("exchangeName").asText(null))
                    .currentPrice(current)
                    .previousClose(prevClose)
                    .dayHigh(decimalOrNull(meta, "regularMarketDayHigh"))
                    .dayLow(decimalOrNull(meta, "regularMarketDayLow"))
                    .volume(meta.path("regularMarketVolume").asLong(0))
                    .fiftyTwoWeekHigh(decimalOrNull(meta, "fiftyTwoWeekHigh"))
                    .fiftyTwoWeekLow(decimalOrNull(meta, "fiftyTwoWeekLow"))
                    .change(change)
                    .changePercent(changePct)
                    .build();

        } catch (Exception e) {
            log.error("Yahoo Finance quote failed for {}: {}", symbol, e.getMessage());
            return null;
        }
    }

    // ----------------------------------------------------------
    // CHART
    // ----------------------------------------------------------
    @Cacheable(value = "stockCharts", key = "#symbol + ':' + #range")
    public StockChart getChart(String symbol, String range) {
        try {
            String interval = resolveInterval(range);
            String url = chartUrl + "/" + symbol
                    + "?interval=" + interval + "&range=" + range;

            String raw = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(raw);
            JsonNode result = root.path("chart").path("result").get(0);
            if (result == null) return null;

            JsonNode ts = result.path("timestamp");
            JsonNode quote = result.path("indicators").path("quote").get(0);

            List<StockChartPoint> points = new ArrayList<>();
            for (int i = 0; i < ts.size(); i++) {
                points.add(StockChartPoint.builder()
                        .timestamp(LocalDateTime.ofInstant(
                                Instant.ofEpochSecond(ts.get(i).asLong()),
                                ZoneId.systemDefault()))
                        .open(nodeDecimal(quote.path("open"), i))
                        .high(nodeDecimal(quote.path("high"), i))
                        .low(nodeDecimal(quote.path("low"), i))
                        .close(nodeDecimal(quote.path("close"), i))
                        .volume(nodeLong(quote.path("volume"), i))
                        .build());
            }

            return StockChart.builder()
                    .symbol(symbol)
                    .range(range)
                    .interval(interval)
                    .points(points)
                    .build();

        } catch (Exception e) {
            log.error("Yahoo Finance chart failed for {}: {}", symbol, e.getMessage());
            return null;
        }
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------
    @Cacheable(value = "stockSearch", key = "#query")
    public List<StockSearchResult> search(String query) {
        try {
            String url = searchUrl + "?q=" + query + "&quotesCount=10&newsCount=0";

            String raw = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(raw);
            JsonNode quotes = root.path("quotes");

            List<StockSearchResult> results = new ArrayList<>();
            for (JsonNode q : quotes) {
                String type = q.path("quoteType").asText("");
                if (!"EQUITY".equals(type) && !"ETF".equals(type)) continue;

                results.add(StockSearchResult.builder()
                        .symbol(q.path("symbol").asText())
                        .shortName(q.path("shortname").asText(null))
                        .longName(q.path("longname").asText(null))
                        .exchange(q.path("exchange").asText(null))
                        .type(type)
                        .build());
            }
            return results;

        } catch (Exception e) {
            log.error("Yahoo Finance search failed for {}: {}", query, e.getMessage());
            return List.of();
        }
    }

    // ----------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------

    private String resolveInterval(String range) {
        return switch (range.toLowerCase()) {
            case "1d" -> "5m";
            case "1w" -> "1h";
            case "1mo" -> "1d";
            case "3mo" -> "1d";
            case "1y" -> "1wk";
            default -> "1d";
        };
    }

    private BigDecimal decimalOrNull(JsonNode node, String field) {
        JsonNode f = node.get(field);
        if (f == null || f.isNull()) return null;
        try { return f.decimalValue(); } catch (Exception e) { return null; }
    }

    private BigDecimal nodeDecimal(JsonNode arr, int idx) {
        if (arr == null || idx >= arr.size()) return null;
        JsonNode n = arr.get(idx);
        if (n == null || n.isNull()) return null;
        try { return n.decimalValue(); } catch (Exception e) { return null; }
    }

    private Long nodeLong(JsonNode arr, int idx) {
        if (arr == null || idx >= arr.size()) return null;
        JsonNode n = arr.get(idx);
        if (n == null || n.isNull()) return null;
        try { return n.longValue(); } catch (Exception e) { return null; }
    }
}