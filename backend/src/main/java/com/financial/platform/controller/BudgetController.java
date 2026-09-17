package com.financial.platform.controller;

import com.financial.platform.dto.request.BudgetRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.BudgetResponse;
import com.financial.platform.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @PreAuthorize("hasAuthority('BUDGET_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getAllBudgets()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('BUDGET_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> active() {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getActiveBudgets()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BUDGET_VIEW_OWN')")
    public ResponseEntity<ApiResponse<BudgetResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.getBudget(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BUDGET_CREATE')")
    public ResponseEntity<ApiResponse<BudgetResponse>> create(
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created",
                        budgetService.createBudget(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('BUDGET_UPDATE_OWN')")
    public ResponseEntity<ApiResponse<BudgetResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Budget updated",
                budgetService.updateBudget(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BUDGET_DELETE_OWN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted", null));
    }
}