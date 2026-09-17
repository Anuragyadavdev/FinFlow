package com.financial.platform.repository;

import com.financial.platform.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    Page<Transaction> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    List<Transaction> findByAccountIdAndIsDeletedFalse(Long accountId);

    // Date range queries
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Sum by type in date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    BigDecimal sumByUserIdAndTypeAndDateRange(
        @Param("userId") Long userId,
        @Param("type") Transaction.TransactionType type,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Category-wise spending
    @Query("SELECT t.category.id, t.category.name, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.type = 'EXPENSE' AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false GROUP BY t.category.id, t.category.name " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> getCategoryWiseSpending(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Monthly trends
    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), t.type, " +
           "COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionDate >= :since " +
           "AND t.isDeleted = false " +
           "GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate), t.type " +
           "ORDER BY YEAR(t.transactionDate), MONTH(t.transactionDate)")
    List<Object[]> getMonthlyTrends(
        @Param("userId") Long userId,
        @Param("since") LocalDateTime since
    );

    // Recent transactions
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.isDeleted = false ORDER BY t.transactionDate DESC")
    Page<Transaction> findRecentTransactions(@Param("userId") Long userId, Pageable pageable);

    // Count by category in period (for anomaly detection)
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.category.id = :categoryId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    long countByCategoryAndPeriod(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Average transaction amount by category
    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.type = 'EXPENSE' AND t.isDeleted = false")
    BigDecimal getAverageAmountByCategory(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId
    );

    // Duplicate detection
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.amount = :amount AND t.account.id = :accountId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    List<Transaction> findPotentialDuplicates(
        @Param("userId") Long userId,
        @Param("amount") BigDecimal amount,
        @Param("accountId") Long accountId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Income stability
    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), " +
           "COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = 'INCOME' " +
           "AND t.transactionDate >= :since AND t.isDeleted = false " +
           "GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate) " +
           "ORDER BY YEAR(t.transactionDate), MONTH(t.transactionDate)")
    List<Object[]> getMonthlyIncome(
        @Param("userId") Long userId,
        @Param("since") LocalDateTime since
    );

        // -------- Analytics-specific queries --------

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    long countByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    BigDecimal avgAmountByTypeAndRange(
        @Param("userId") Long userId,
        @Param("type") Transaction.TransactionType type,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t.category.id, t.category.name, t.category.icon, " +
           "COALESCE(SUM(t.amount), 0), COUNT(t) " +
           "FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false " +
           "GROUP BY t.category.id, t.category.name, t.category.icon " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> getCategoryBreakdown(
        @Param("userId") Long userId,
        @Param("type") Transaction.TransactionType type,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t.category.id, t.category.name, t.category.icon, " +
           "COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false " +
           "GROUP BY t.category.id, t.category.name, t.category.icon")
    List<Object[]> getExpenseByCategoryForRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    BigDecimal sumByCategoryAndRange(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    BigDecimal sumByCategoryTypeAndRange(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("type") Transaction.TransactionType type,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

        // -------- Anomaly detection queries --------

    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transactionDate < :beforeDate " +
           "AND t.isDeleted = false")
    BigDecimal getCategoryAverageBefore(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("beforeDate") LocalDateTime beforeDate
    );

    @Query("SELECT COALESCE(STDDEV(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transactionDate < :beforeDate " +
           "AND t.isDeleted = false")
    BigDecimal getCategoryStdDevBefore(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("beforeDate") LocalDateTime beforeDate
    );

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "AND t.isDeleted = false")
    long countInRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

}