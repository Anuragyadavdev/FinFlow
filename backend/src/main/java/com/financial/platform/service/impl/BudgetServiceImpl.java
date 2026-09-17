package com.financial.platform.service.impl;

import com.financial.platform.dto.request.BudgetRequest;
import com.financial.platform.dto.response.BudgetResponse;
import com.financial.platform.entity.Budget;
import com.financial.platform.entity.Category;
import com.financial.platform.entity.User;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.BudgetMapper;
import com.financial.platform.repository.BudgetRepository;
import com.financial.platform.repository.CategoryRepository;
import com.financial.platform.repository.TransactionRepository;
import com.financial.platform.service.BudgetService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetMapper budgetMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgets() {
        Long userId = SecurityUtils.getCurrentUserId();
        return budgetRepository.findByUserIdAndIsDeletedFalse(userId)
                .stream()
                .map(b -> {
                    recalculate(b);
                    return budgetMapper.toResponse(b);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getActiveBudgets() {
        Long userId = SecurityUtils.getCurrentUserId();
        return budgetRepository.findActiveBudgetsForDate(userId, LocalDate.now())
                .stream()
                .map(b -> {
                    recalculate(b);
                    return budgetMapper.toResponse(b);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudget(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Budget budget = budgetRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        recalculate(budget);
        return budgetMapper.toResponse(budget);
    }

    @Override
    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User user = SecurityUtils.getCurrentUser();

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category", request.getCategoryId()));

        // Prevent overlapping budget for same category
        budgetRepository.findActiveBudgetForCategory(
                user.getId(), category.getId(), request.getStartDate())
                .ifPresent(b -> {
                    throw new BadRequestException(
                            "An active budget for this category already exists in this period");
                });

        Budget budget = budgetMapper.toEntity(request, user, category);
        Budget saved = budgetRepository.save(budget);
        recalculate(saved);
        budgetRepository.save(saved);

        log.info("Created budget {} for user {}", saved.getId(), user.getId());
        return budgetMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Budget budget = budgetRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category", request.getCategoryId()));

        budgetMapper.updateEntity(budget, request, category);
        recalculate(budget);
        Budget updated = budgetRepository.save(budget);
        return budgetMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Budget budget = budgetRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        budget.setIsDeleted(true);
        budget.setIsActive(false);
        budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public void recalculateSpending(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId).orElse(null);
        if (budget == null) return;
        recalculate(budget);
        budgetRepository.save(budget);
    }

    // ---------------------- INTERNAL ----------------------

    private void recalculate(Budget budget) {
        if (budget.getCategory() == null) return;

        LocalDateTime start = budget.getStartDate().atStartOfDay();
        LocalDateTime end = budget.getEndDate().atTime(LocalTime.MAX);

        BigDecimal spent = transactionRepository.sumByUserIdAndTypeAndDateRange(
                budget.getUser().getId(),
                com.financial.platform.entity.Transaction.TransactionType.EXPENSE,
                start, end);

        // Filter by category: transactionRepository doesn't have a category-scoped sum,
        // so use category-wise query and pick the matching entry.
        List<Object[]> rows = transactionRepository.getCategoryWiseSpending(
                budget.getUser().getId(), start, end);

        BigDecimal catSpent = BigDecimal.ZERO;
        for (Object[] row : rows) {
            Long catId = row[0] != null ? ((Number) row[0]).longValue() : null;
            if (catId != null && catId.equals(budget.getCategory().getId())) {
                catSpent = (BigDecimal) row[2];
                break;
            }
        }

        budget.setSpentAmount(catSpent);
        // Suppress unused warning while keeping variable for future use
        if (spent == null) log.trace("Total spent computed: 0");
    }
}