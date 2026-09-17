package com.financial.platform.service.ai;

import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Simple keyword-based intent classifier.
 * No AI here — deterministic and fast.
 */
@Component
public class IntentClassifier {

    public enum Intent {
        SPENDING_BREAKDOWN,      // "where did my money go"
        CATEGORY_COMPARISON,     // "compare food vs shopping"
        PERIOD_COMPARISON,       // "this month vs last month"
        SAVINGS_ANALYSIS,        // "how much did I save"
        TOP_EXPENSES,            // "biggest expenses"
        TREND_ANALYSIS,          // "is my spending increasing"
        ANOMALY_QUERY,           // "unusual transactions"
        BUDGET_STATUS,           // "am I over budget"
        GOAL_STATUS,             // "how close am I to my goal"
        INVESTMENT_QUERY,        // "how is my portfolio"
        STOCK_QUERY,             // "how is reliance doing"
        GENERAL_SUMMARY,         // "give me an overview"
        UNKNOWN
    }

    public Intent classify(String question) {
        if (question == null || question.isBlank()) return Intent.UNKNOWN;

        String q = question.toLowerCase(Locale.ENGLISH);

        if (contains(q, "where did my money", "where did i spend",
                "where has my money", "spending breakdown", "spend breakdown")) {
            return Intent.SPENDING_BREAKDOWN;
        }
        if (contains(q, "top expense", "biggest expense", "most money",
                "highest spend", "largest expense")) {
            return Intent.TOP_EXPENSES;
        }
        if (contains(q, "compare", "vs", "versus") && contains(q, "month")) {
            return Intent.PERIOD_COMPARISON;
        }
        if (contains(q, "compare") && contains(q, "categor")) {
            return Intent.CATEGORY_COMPARISON;
        }
        if (contains(q, "how much did i save", "savings", "saved",
                "savings rate", "how much saved")) {
            return Intent.SAVINGS_ANALYSIS;
        }
        if (contains(q, "trend", "increasing", "decreasing",
                "becoming a trend", "over time")) {
            return Intent.TREND_ANALYSIS;
        }
        if (contains(q, "unusual", "anomal", "weird", "suspicious",
                "fraud", "strange")) {
            return Intent.ANOMALY_QUERY;
        }
        if (contains(q, "budget", "over budget", "under budget", "overspend")) {
            return Intent.BUDGET_STATUS;
        }
        if (contains(q, "goal", "target", "am i on track")) {
            return Intent.GOAL_STATUS;
        }
        if (contains(q, "portfolio", "investment", "invested", "mutual fund")) {
            return Intent.INVESTMENT_QUERY;
        }
        if (contains(q, "stock", "share", "reliance", "tcs", "infosys",
                "hdfc", "nifty", "sensex")) {
            return Intent.STOCK_QUERY;
        }
        if (contains(q, "summary", "overview", "how am i doing",
                "financial health", "overall")) {
            return Intent.GENERAL_SUMMARY;
        }

        return Intent.UNKNOWN;
    }

    private boolean contains(String source, String... keywords) {
        for (String k : keywords) {
            if (source.contains(k)) return true;
        }
        return false;
    }
}