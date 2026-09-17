package com.financial.platform.service.ai;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PromptBuilder {

    public String buildFinancialAssistantPrompt(
            String userQuestion,
            String intent,
            Map<String, Object> sourceData) {

        String dataJson = toPrettyJson(sourceData);

        return """
                You are a helpful and honest financial assistant for a personal finance app.

                STRICT RULES — follow without exception:
                1. Use ONLY the data provided below. Never invent numbers.
                2. If the data does not contain an answer, say so plainly.
                3. Be concise and clear. Aim for 3-6 sentences.
                4. Use ₹ for currency and Indian number formatting (e.g., ₹1,25,000).
                5. Never promise investment returns.
                6. Never give regulated financial advice. Educational tone only.
                7. If you mention a number, it MUST come from the data block.
                8. Do not greet the user. Answer directly.

                INTENT DETECTED: %s

                USER QUESTION:
                %s

                FINANCIAL DATA (this is the ONLY source of truth):
                %s

                Now write your answer following all rules above.
                """.formatted(intent, userQuestion, dataJson);
    }

    public String buildInvestmentAdvisorPrompt(
            String userQuestion,
            Map<String, Object> userContext,
            Map<String, Object> marketData) {

        return """
                You are an educational investment advisor for a personal finance app.

                STRICT RULES:
                1. Use ONLY the data provided. Never invent prices or returns.
                2. Never guarantee returns.
                3. Present your answer as: FACT / CALCULATION / SUGGESTION / RISK.
                4. Suggest 2-3 options at most, with reasons.
                5. Mention risk level of each suggestion (LOW / MEDIUM / HIGH).
                6. Keep it under 200 words.
                7. Always end with: "This is educational, not financial advice."

                USER QUESTION:
                %s

                USER CONTEXT (income, savings, goals, risk profile):
                %s

                MARKET DATA (live stock quotes):
                %s

                Answer now.
                """.formatted(userQuestion, toPrettyJson(userContext), toPrettyJson(marketData));
    }

    private String toPrettyJson(Map<String, Object> data) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper m =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            return m.writerWithDefaultPrettyPrinter().writeValueAsString(data);
        } catch (Exception e) {
            return String.valueOf(data);
        }
    }


    //change
        public String buildInvestmentAdvisorPrompt(
            String userQuestion,
            java.math.BigDecimal amount,
            String riskProfile,
            String timeHorizon,
            java.util.Map<String, Object> userContext,
            java.util.Map<String, Object> marketData) {

        return """
                You are an educational investment advisor for an Indian personal finance app.

                STRICT RULES — follow without exception:
                1. Use ONLY the data provided below. Never invent prices, returns, or numbers.
                2. Never guarantee returns. Never say "will definitely" or "guaranteed".
                3. Structure your answer into exactly 4 sections:
                   FACTS          — bullet points from user context + market data
                   CALCULATIONS   — projections using math only (compound interest etc.)
                   SUGGESTIONS    — 2-3 options with allocation, risk, and horizon
                   RISKS          — bullet list of what could go wrong
                4. Use ₹ and Indian number formatting (e.g., ₹1,25,000).
                5. Keep total under 350 words.
                6. End with exactly this line:
                   "This is educational, not financial advice."

                INVESTMENT AMOUNT: ₹%s
                RISK PROFILE: %s
                TIME HORIZON: %s

                USER QUESTION:
                %s

                USER CONTEXT (income, savings, existing investments, goals):
                %s

                MARKET DATA (live quotes as of now):
                %s

                Now produce the structured answer.
                """.formatted(
                        amount,
                        riskProfile,
                        timeHorizon,
                        userQuestion,
                        toPrettyJson(userContext),
                        toPrettyJson(marketData));
    }
}