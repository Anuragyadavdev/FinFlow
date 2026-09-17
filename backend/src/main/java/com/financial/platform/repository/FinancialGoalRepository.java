package com.financial.platform.repository;

import com.financial.platform.entity.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {

    List<FinancialGoal> findByUserIdAndIsDeletedFalse(Long userId);

    List<FinancialGoal> findByUserIdAndStatusAndIsDeletedFalse(
        Long userId, FinancialGoal.GoalStatus status
    );

    Optional<FinancialGoal> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    @Query("SELECT g FROM FinancialGoal g WHERE g.user.id = :userId " +
           "AND g.status = 'ACTIVE' AND g.isDeleted = false " +
           "AND g.targetDate < :date AND g.currentAmount < g.targetAmount")
    List<FinancialGoal> findGoalsBehindSchedule(
        @Param("userId") Long userId,
        @Param("date") LocalDate date
    );

    @Query("SELECT g FROM FinancialGoal g WHERE g.status = 'ACTIVE' " +
           "AND g.isDeleted = false AND g.targetDate < :date " +
           "AND g.currentAmount < g.targetAmount")
    List<FinancialGoal> findAllGoalsBehindSchedule(@Param("date") LocalDate date);

    long countByUserIdAndStatusAndIsDeletedFalse(Long userId, FinancialGoal.GoalStatus status);
}