package com.financial.platform.service.impl;

import com.financial.platform.dto.response.ai.AiAnswerResponse;
import com.financial.platform.dto.response.analytics.AnalyticsSummary;
import com.financial.platform.dto.response.anomaly.AnomalyResponse;
import com.financial.platform.dto.response.stock.StockQuote;
import com.financial.platform.integration.gemini.GeminiClient;
import com.financial.platform.service.AiService;
import com.financial.platform.service.AnalyticsService;
import com.financial.platform.service.AnomalyService;
import com.financial.platform.service.StockService;
import com.financial.platform.service.ai.IntentClassifier;
import com.financial.platform.service.ai.PromptBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

//change

import com.financial.platform.dto.request.ai.AdviceRequest;
import com.financial.platform.dto.response.ai.AdviceResponse;
import com.financial.platform.entity.UserPreference;
import com.financial.platform.repository.InvestmentRepository;
import com.financial.platform.repository.UserPreferenceRepository;
import com.financial.platform.service.BudgetService;
import com.financial.platform.service.GoalService;
import com.financial.platform.service.InvestmentService;
import com.financial.platform.util.SecurityUtils;
import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final IntentClassifier classifier;
    private final PromptBuilder promptBuilder;
    private final GeminiClient gemini;
    private final AnalyticsService analyticsService;
    private final AnomalyService anomalyService;
    private final StockService stockService;

    private final InvestmentRepository investmentRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final InvestmentService investmentService;
    private final GoalService goalService;

    @Override
    public AiAnswerResponse ask(String question) {
        IntentClassifier.Intent intent = classifier.classify(question);
        log.info("AI question intent: {}", intent);

        Map<String, Object> sourceData = fetchSourceData(intent, question);

        String prompt = promptBuilder.buildFinancialAssistantPrompt(
                question, intent.name(), sourceData);

        String answer = gemini.generate(prompt);

        boolean fallback = false;
        if (answer == null) {
            fallback = true;
            answer = buildFallbackAnswer(intent, sourceData);
        }

        return AiAnswerResponse.builder()
                .question(question)
                .answer(answer)
                .intent(intent.name())
                .sourceData(sourceData)
                .suggestedFollowUps(suggestFollowUps(intent))
                .model("gemini-1.5-flash")
                .generatedAt(LocalDateTime.now())
                .fallback(fallback)
                .build();
    }



    // ============================================================
    // DATA FETCH (deterministic)
    // ============================================================

    private Map<String, Object> fetchSourceData(
            IntentClassifier.Intent intent, String question) {

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("generated_at", LocalDateTime.now().toString());

        try {
            switch (intent) {
                case SPENDING_BREAKDOWN, TOP_EXPENSES, GENERAL_SUMMARY -> {
                    AnalyticsSummary s = analyticsService.getCurrentMonthSummary();
                    data.put("period", s.getPeriodLabel());
                    data.put("total_income", s.getTotalIncome());
                    data.put("total_expense", s.getTotalExpense());
                    data.put("net_savings", s.getNetSavings());
                    data.put("savings_rate_percent", s.getSavingsRate());
                    data.put("top_expense_categories",
                            s.getTopExpenseCategories());
                }
                case PERIOD_COMPARISON -> {
                    AnalyticsSummary s = analyticsService.getCurrentMonthSummary();
                    data.put("period", s.getPeriodLabel());
                    data.put("current_total_expense", s.getTotalExpense());
                    data.put("current_total_income", s.getTotalIncome());
                    data.put("comparison", s.getPeriodComparison());
                }
                case SAVINGS_ANALYSIS -> {
                    AnalyticsSummary s = analyticsService.getSummaryForMonths(6);
                    data.put("period", s.getPeriodLabel());
                    data.put("savings_rate_percent", s.getSavingsRate());
                    data.put("net_savings", s.getNetSavings());
                    data.put("monthly_trends", s.getMonthlyTrends());
                }
                case TREND_ANALYSIS -> {
                    AnalyticsSummary s = analyticsService.getSummaryForMonths(6);
                    data.put("monthly_trends", s.getMonthlyTrends());
                    data.put("category_changes", s.getCategoryChanges());
                }
                case CATEGORY_COMPARISON -> {
                    AnalyticsSummary s = analyticsService.getCurrentMonthSummary();
                    data.put("category_changes", s.getCategoryChanges());
                }
                case ANOMALY_QUERY -> {
                    Page<AnomalyResponse> p = anomalyService.listAnomalies(0, 10);
                    data.put("unreviewed_count", anomalyService.countUnreviewed());
                    data.put("recent_anomalies", p.getContent());
                }
                case BUDGET_STATUS -> {
                    AnalyticsSummary s = analyticsService.getCurrentMonthSummary();
                    data.put("period", s.getPeriodLabel());
                    // Budgets handled via dashboard in future
                    data.put("hint", "Budgets are available at /api/budgets/active");
                }
                case GOAL_STATUS -> {
                    data.put("hint", "Goals are available at /api/goals");
                }
                case INVESTMENT_QUERY -> {
                    data.put("hint", "Investments are available at /api/investments");
                }
                case STOCK_QUERY -> {
                    List<String> symbols = extractSymbols(question);
                    Map<String, Object> quotes = new LinkedHashMap<>();
                    for (String sym : symbols) {
                        StockQuote q = stockService.getQuote(sym);
                        if (q != null) quotes.put(sym, q);
                    }
                    if (quotes.isEmpty()) quotes.put("RELIANCE.NS",
                            stockService.getQuote("RELIANCE.NS"));
                    data.put("quotes", quotes);
                }
                default -> {
                    AnalyticsSummary s = analyticsService.getCurrentMonthSummary();
                    data.put("period", s.getPeriodLabel());
                    data.put("total_income", s.getTotalIncome());
                    data.put("total_expense", s.getTotalExpense());
                    data.put("net_savings", s.getNetSavings());
                }
            }
        } catch (Exception e) {
            log.error("Failed to gather source data: {}", e.getMessage());
            data.put("error", "Could not gather financial data: " + e.getMessage());
        }
        return data;
    }

    private List<String> extractSymbols(String question) {
        String q = question.toUpperCase(Locale.ENGLISH);
        List<String> found = new ArrayList<>();
        String[] candidates = {
                "RELIANCE", "TCS", "INFOSYS", "INFY", "HDFC", "HDFCBANK",
                "ICICI", "ICICIBANK", "SBIN", "ITC", "LT", "WIPRO",
                "TATAMOTORS", "TATASTEEL", "AXISBANK", "KOTAKBANK",
                "MARUTI", "SUNPHARMA", "TITAN", "BAJFINANCE"
        };
        for (String c : candidates) {
            if (q.contains(c)) found.add(c + ".NS");
        }
        return found;
    }

    // ============================================================
    // FALLBACK (when Gemini is unavailable)
    // ============================================================

    private String buildFallbackAnswer(
            IntentClassifier.Intent intent, Map<String, Object> data) {

        return switch (intent) {
            case SPENDING_BREAKDOWN, TOP_EXPENSES ->
                    "Based on your current month data: " + summarize(data);
            case SAVINGS_ANALYSIS ->
                    "Your savings data: " + summarize(data);
            case PERIOD_COMPARISON ->
                    "Comparison data: " + summarize(data);
            case ANOMALY_QUERY ->
                    "Recent anomalies: " + summarize(data);
            case STOCK_QUERY ->
                    "Latest quotes: " + summarize(data);
            default ->
                    "(AI service is temporarily unavailable.) Here's what I found: "
                            + summarize(data);
        };
    }

    private String summarize(Map<String, Object> data) {
        StringBuilder sb = new StringBuilder();
        data.forEach((k, v) -> {
            if (!"generated_at".equals(k) && v != null) {
                sb.append(k).append(": ").append(v).append("; ");
            }
        });
        return sb.length() > 400 ? sb.substring(0, 400) + "..." : sb.toString();
    }

    // ============================================================
    // FOLLOW-UPS
    // ============================================================

    private List<String> suggestFollowUps(IntentClassifier.Intent intent) {
        return switch (intent) {
            case SPENDING_BREAKDOWN -> List.of(
                    "Compare this month with last month",
                    "Which category increased the most?",
                    "How much did I save this month?");
            case SAVINGS_ANALYSIS -> List.of(
                    "What's my savings trend over 6 months?",
                    "How can I save more?",
                    "Which months did I save the most?");
            case ANOMALY_QUERY -> List.of(
                    "Show me unreviewed anomalies",
                    "Was there any duplicate charge?",
                    "Which category has the most anomalies?");
            case STOCK_QUERY -> List.of(
                    "Show Nifty 50 top gainers",
                    "How has Reliance performed this month?",
                    "Give me an investment suggestion");
            default -> List.of(
                    "Where did my money go this month?",
                    "How much did I save?",
                    "Any unusual transactions?");
        };
    }

    //adding
    @Override
    public AdviceResponse advise(AdviceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        // --- Risk profile ---
        String risk = request.getRiskTolerance();
        if (risk == null || risk.isBlank()) {
            risk = userPreferenceRepository.findByUserId(userId)
                    .map(UserPreference::getRiskTolerance)
                    .orElse("MODERATE");
        }

        String horizon = request.getTimeHorizon();
        if (horizon == null || horizon.isBlank()) horizon = "MEDIUM";

        // --- User context ---
        AnalyticsSummary month = analyticsService.getCurrentMonthSummary();
        Map<String, Object> userContext = new LinkedHashMap<>();
        userContext.put("monthly_income", month.getTotalIncome());
        userContext.put("monthly_expenses", month.getTotalExpense());
        userContext.put("monthly_savings", month.getNetSavings());
        userContext.put("savings_rate_percent", month.getSavingsRate());
        userContext.put("investment_amount", request.getAmount());

        try {
            BigDecimal totalInvested = investmentRepository
                    .getTotalInvestedAmount(userId);
            BigDecimal totalValue = investmentRepository
                    .getTotalCurrentValue(userId);
            userContext.put("existing_investments_value", totalValue);
            userContext.put("existing_investments_cost", totalInvested);
        } catch (Exception ignored) {}

        try {
            userContext.put("active_goals", goalService.getAllGoals());
        } catch (Exception ignored) {}

        // --- Market snapshot (live) ---
        Map<String, Object> market = new LinkedHashMap<>();
        market.put("as_of", LocalDateTime.now().toString());

        Map<String, Object> gainers = new LinkedHashMap<>();
        try {
            stockService.getGainers().stream().limit(5).forEach(q ->
                    gainers.put(q.getSymbol(), Map.of(
                            "price", q.getCurrentPrice(),
                            "change_percent", q.getChangePercent())));
        } catch (Exception ignored) {}
        market.put("top_gainers", gainers);

        Map<String, Object> stable = new LinkedHashMap<>();
        try {
            for (String sym : List.of("RELIANCE.NS", "TCS.NS", "HDFCBANK.NS",
                                      "ITC.NS", "HINDUNILVR.NS")) {
                StockQuote q = stockService.getQuote(sym);
                if (q != null) {
                    stable.put(sym, Map.of(
                            "name", q.getShortName() == null ? sym : q.getShortName(),
                            "price", q.getCurrentPrice(),
                            "change_percent", q.getChangePercent()));
                }
            }
        } catch (Exception ignored) {}
        market.put("blue_chips", stable);

        // --- Prompt Gemini ---
        String prompt = promptBuilder.buildInvestmentAdvisorPrompt(
                request.getQuestion(),
                request.getAmount(),
                risk, horizon,
                userContext, market);

        String raw = gemini.generate(prompt);
        boolean fallback = false;

        if (raw == null) {
            fallback = true;
            return buildFallbackAdvice(request, risk, horizon, userContext, market);
        }

        // Parse structured sections from Gemini's output
        return parseAdvice(raw, request, risk, horizon, userContext, market, fallback);
    }

    private AdviceResponse parseAdvice(String raw, AdviceRequest req,
                                       String risk, String horizon,
                                       Map<String, Object> ctx,
                                       Map<String, Object> market,
                                       boolean fallback) {
        List<String> facts = new ArrayList<>();
        List<String> calculations = new ArrayList<>();
        List<String> risks = new ArrayList<>();
        List<AdviceResponse.Suggestion> suggestions = new ArrayList<>();
        String summary = raw;

        // Very light parsing — look for section headers
        String[] lines = raw.split("\\r?\\n");
        String section = "";
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            String upper = trimmed.toUpperCase();
            if (upper.startsWith("FACTS")) { section = "facts"; continue; }
            if (upper.startsWith("CALCULATION")) { section = "calcs"; continue; }
            if (upper.startsWith("SUGGESTION")) { section = "sug"; continue; }
            if (upper.startsWith("RISK")) { section = "risk"; continue; }

            String bullet = trimmed.replaceFirst("^[\\-•*]\\s*", "");
            switch (section) {
                case "facts" -> facts.add(bullet);
                case "calcs" -> calculations.add(bullet);
                case "risk"  -> risks.add(bullet);
                case "sug"   -> suggestions.add(AdviceResponse.Suggestion.builder()
                        .title(bullet).reason(bullet)
                        .riskLevel(risk).horizon(horizon).build());
                default -> { /* summary fallback */ }
            }
        }

        if (facts.isEmpty() && calculations.isEmpty() && suggestions.isEmpty()) {
            // Gemini didn't follow format — put everything as summary
            summary = raw;
        }

        return AdviceResponse.builder()
                .question(req.getQuestion())
                .amount(req.getAmount())
                .facts(facts)
                .calculations(calculations)
                .suggestions(suggestions)
                .risks(risks)
                .summary(summary)
                .userContext(ctx)
                .marketSnapshot(market)
                .disclaimer("This is educational, not financial advice.")
                .model("gemini-1.5-flash")
                .generatedAt(LocalDateTime.now())
                .fallback(fallback)
                .build();
    }

    private AdviceResponse buildFallbackAdvice(
            AdviceRequest req, String risk, String horizon,
            Map<String, Object> ctx, Map<String, Object> market) {

        return AdviceResponse.builder()
                .question(req.getQuestion())
                .amount(req.getAmount())
                .facts(List.of(
                        "AI advisor is temporarily unavailable.",
                        "Your monthly savings: ₹" + ctx.get("monthly_savings"),
                        "Risk profile: " + risk))
                .calculations(List.of(
                        "SIP of ₹" + req.getAmount().divide(BigDecimal.valueOf(12), 2,
                                java.math.RoundingMode.HALF_UP)
                                + "/month over 1 year = ₹" + req.getAmount()))
                .risks(List.of(
                        "Markets are volatile.",
                        "Past performance does not guarantee future returns."))
                .summary("Advisor offline — showing raw context. Please try again.")
                .userContext(ctx)
                .marketSnapshot(market)
                .disclaimer("This is educational, not financial advice.")
                .fallback(true)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}