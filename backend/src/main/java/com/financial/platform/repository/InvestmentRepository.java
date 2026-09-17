package com.financial.platform.repository;

import com.financial.platform.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByUserIdAndIsDeletedFalse(Long userId);

    List<Investment> findByUserIdAndIsActiveTrueAndIsDeletedFalse(Long userId);

    Optional<Investment> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    List<Investment> findByUserIdAndInvestmentTypeAndIsDeletedFalse(
        Long userId, Investment.InvestmentType type
    );

    Optional<Investment> findByUserIdAndStockSymbolAndIsDeletedFalse(Long userId, String stockSymbol);

    @Query("SELECT COALESCE(SUM(i.investedAmount), 0) FROM Investment i " +
           "WHERE i.user.id = :userId AND i.isActive = true AND i.isDeleted = false")
    BigDecimal getTotalInvestedAmount(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.currentValue), 0) FROM Investment i " +
           "WHERE i.user.id = :userId AND i.isActive = true AND i.isDeleted = false")
    BigDecimal getTotalCurrentValue(@Param("userId") Long userId);

    @Query("SELECT i.investmentType, COALESCE(SUM(i.currentValue), 0) " +
           "FROM Investment i WHERE i.user.id = :userId " +
           "AND i.isActive = true AND i.isDeleted = false " +
           "GROUP BY i.investmentType")
    List<Object[]> getAllocationByType(@Param("userId") Long userId);
}