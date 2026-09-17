package com.financial.platform.service;

import com.financial.platform.dto.response.analytics.AnalyticsSummary;

import java.time.LocalDate;

public interface AnalyticsService {

    AnalyticsSummary getSummary(LocalDate startDate, LocalDate endDate);

    AnalyticsSummary getCurrentMonthSummary();

    AnalyticsSummary getSummaryForMonths(int monthsBack);
}