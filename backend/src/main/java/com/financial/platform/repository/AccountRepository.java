package com.financial.platform.repository;

import com.financial.platform.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserIdAndIsDeletedFalse(Long userId);

    List<Account> findByUserIdAndIsActiveTrueAndIsDeletedFalse(Long userId);

    Optional<Account> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a " +
           "WHERE a.user.id = :userId AND a.isActive = true AND a.isDeleted = false")
    BigDecimal getTotalBalanceByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a " +
           "WHERE a.user.id = :userId AND a.type = :type " +
           "AND a.isActive = true AND a.isDeleted = false")
    BigDecimal getTotalBalanceByUserIdAndType(
        @Param("userId") Long userId,
        @Param("type") Account.AccountType type
    );

    long countByUserIdAndIsDeletedFalse(Long userId);

    boolean existsByUserIdAndNameAndIsDeletedFalse(Long userId, String name);
}