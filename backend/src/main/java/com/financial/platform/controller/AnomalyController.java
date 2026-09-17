package com.financial.platform.controller;

import com.financial.platform.dto.request.AnomalyReviewRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.anomaly.AnomalyResponse;
import com.financial.platform.service.AnomalyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/anomalies")
@RequiredArgsConstructor
public class AnomalyController {

    private final AnomalyService anomalyService;

    @GetMapping
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<Page<AnomalyResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                anomalyService.listAnomalies(page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AnomalyResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                anomalyService.getAnomaly(id)));
    }

    @GetMapping("/unreviewed-count")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<Long>> unreviewedCount() {
        return ResponseEntity.ok(ApiResponse.success(
                anomalyService.countUnreviewed()));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AnomalyResponse>> review(
            @PathVariable Long id,
            @Valid @RequestBody AnomalyReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reviewed",
                anomalyService.review(id, request.getIsFalsePositive(),
                        request.getReviewNotes())));
    }

    /** Manual trigger — runs detection on recent 30 days of transactions. */
    @PostMapping("/scan")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scan() {
        int created = anomalyService.runDetectionForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                "Detection complete",
                Map.of("newAnomalies", created)));
    }
}