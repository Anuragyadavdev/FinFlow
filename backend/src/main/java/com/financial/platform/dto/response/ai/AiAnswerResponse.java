package com.financial.platform.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnswerResponse {

    private String question;
    private String answer;

    /** Intent detected by the classifier */
    private String intent;

    /** Deterministic source data used to generate the answer — for transparency */
    private Map<String, Object> sourceData;

    /** Optional follow-up suggestions */
    private List<String> suggestedFollowUps;

    private String model;
    private LocalDateTime generatedAt;

    /** True when AI service is unavailable and a fallback was used */
    private boolean fallback;
}