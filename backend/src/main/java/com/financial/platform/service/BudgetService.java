package com.financial.platform.service;

import com.financial.platform.dto.request.BudgetRequest;
import com.financial.platform.dto.response.BudgetResponse;

import java.util.List;

public interface BudgetService {
    List<BudgetResponse> getAllBudgets();
    List<BudgetResponse> getActiveBudgets();
    BudgetResponse getBudget(Long id);
    BudgetResponse createBudget(BudgetRequest request);
    BudgetResponse updateBudget(Long id, BudgetRequest request);
    void deleteBudget(Long id);
    void recalculateSpending(Long budgetId);
}