package com.financial.platform.service.impl;

import com.financial.platform.dto.request.GoalRequest;
import com.financial.platform.dto.response.GoalResponse;
import com.financial.platform.entity.FinancialGoal;
import com.financial.platform.entity.User;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.GoalMapper;
import com.financial.platform.repository.FinancialGoalRepository;
import com.financial.platform.service.GoalService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final FinancialGoalRepository goalRepository;
    private final GoalMapper goalMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getAllGoals() {
        Long userId = SecurityUtils.getCurrentUserId();
        return goalRepository.findByUserIdAndIsDeletedFalse(userId)
                .stream()
                .map(goalMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoal(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        FinancialGoal goal = goalRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        return goalMapper.toResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse createGoal(GoalRequest request) {
        User user = SecurityUtils.getCurrentUser();
        FinancialGoal goal = goalMapper.toEntity(request, user);
        FinancialGoal saved = goalRepository.save(goal);
        log.info("Created goal {} for user {}", saved.getId(), user.getId());
        return goalMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long id, GoalRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        FinancialGoal goal = goalRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        goalMapper.updateEntity(goal, request);
        return goalMapper.toResponse(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public GoalResponse addProgress(Long id, BigDecimal amount) {
        Long userId = SecurityUtils.getCurrentUserId();
        FinancialGoal goal = goalRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be positive");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(FinancialGoal.GoalStatus.COMPLETED);
        }

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public void deleteGoal(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        FinancialGoal goal = goalRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        goal.setIsDeleted(true);
        goalRepository.save(goal);
    }
}