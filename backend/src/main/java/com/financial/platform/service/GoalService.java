package com.financial.platform.service;

import com.financial.platform.dto.request.GoalRequest;
import com.financial.platform.dto.response.GoalResponse;

import java.math.BigDecimal;
import java.util.List;

public interface GoalService {
    List<GoalResponse> getAllGoals();
    GoalResponse getGoal(Long id);
    GoalResponse createGoal(GoalRequest request);
    GoalResponse updateGoal(Long id, GoalRequest request);
    GoalResponse addProgress(Long id, BigDecimal amount);
    void deleteGoal(Long id);
}