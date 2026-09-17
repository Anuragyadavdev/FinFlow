package com.financial.platform.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdviceResponse {

    private String question;
    private BigDecimal amount;

    // Structured advice
    private List<String> facts;
    private List<String> calculations;
    private List<Suggestion> suggestions;
    private List<String> risks;
    private String summary;

    // Transparency
    private Map<String, Object> userContext;
    private Map<String, Object> marketSnapshot;

    private String disclaimer;
    private String model;
    private LocalDateTime generatedAt;
    private boolean fallback;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Suggestion {
        private String title;
        private String reason;
        private String riskLevel;      // LOW / MEDIUM / HIGH
        private String allocation;     // e.g. "₹20,000 (40%)"
        private String horizon;        // SHORT / MEDIUM / LONG
    }
}