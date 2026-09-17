package com.financial.platform.repository;

import com.financial.platform.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndIsDeletedFalse(Long userId);

    Optional<Budget> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.isActive = true AND b.isDeleted = false " +
           "AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetsForDate(
        @Param("userId") Long userId,
        @Param("date") LocalDate date
    );

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.category.id = :categoryId AND b.isActive = true " +
           "AND b.isDeleted = false " +
           "AND b.startDate <= :date AND b.endDate >= :date")
    Optional<Budget> findActiveBudgetForCategory(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("date") LocalDate date
    );

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.isActive = true AND b.isDeleted = false " +
           "AND b.spentAmount >= (b.allocatedAmount * b.alertThreshold / 100)")
    List<Budget> findBudgetsNearLimit(@Param("userId") Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.isActive = true AND b.isDeleted = false " +
           "AND b.spentAmount > b.allocatedAmount")
    List<Budget> findExceededBudgets(@Param("userId") Long userId);
}