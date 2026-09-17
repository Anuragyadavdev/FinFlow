package com.financial.platform.controller;

import com.financial.platform.dto.request.GoalRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.GoalResponse;
import com.financial.platform.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @PreAuthorize("hasAuthority('GOAL_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(goalService.getAllGoals()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GOAL_VIEW_OWN')")
    public ResponseEntity<ApiResponse<GoalResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoal(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GOAL_CREATE')")
    public ResponseEntity<ApiResponse<GoalResponse>> create(
            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created",
                        goalService.createGoal(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GOAL_UPDATE_OWN')")
    public ResponseEntity<ApiResponse<GoalResponse>> update(
            @PathVariable Long id, @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Goal updated",
                goalService.updateGoal(id, request)));
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAuthority('GOAL_UPDATE_OWN')")
    public ResponseEntity<ApiResponse<GoalResponse>> addProgress(
            @PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(ApiResponse.success("Progress updated",
                goalService.addProgress(id, body.get("amount"))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GOAL_DELETE_OWN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted", null));
    }
}