package com.financial.platform.controller;

import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.analytics.AnalyticsSummary;
import com.financial.platform.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** Current month summary */
    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AnalyticsSummary>> currentMonth() {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getCurrentMonthSummary()));
    }

    /** Custom date range */
    @GetMapping("/summary/range")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AnalyticsSummary>> range(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getSummary(start, end)));
    }

    /** Last N months */
    @GetMapping("/summary/months/{months}")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AnalyticsSummary>> lastMonths(
            @PathVariable int months) {
        if (months < 1 || months > 24) months = 6;
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getSummaryForMonths(months)));
    }
}