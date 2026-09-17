package com.financial.platform.repository;

import com.financial.platform.entity.Anomaly;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, Long> {

    Page<Anomaly> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    List<Anomaly> findByUserIdAndIsReviewedFalseAndIsDeletedFalse(Long userId);

    Optional<Anomaly> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    long countByUserIdAndIsReviewedFalseAndIsDeletedFalse(Long userId);

    @Query("SELECT a.severity, COUNT(a) FROM Anomaly a " +
           "WHERE a.user.id = :userId AND a.isDeleted = false " +
           "GROUP BY a.severity")
    List<Object[]> countBySeverity(@Param("userId") Long userId);
}