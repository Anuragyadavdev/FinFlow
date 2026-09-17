package com.financial.platform.repository;

import com.financial.platform.entity.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    Page<Recommendation> findByUserIdAndIsDismissedFalseAndIsDeletedFalse(
        Long userId, Pageable pageable
    );

    List<Recommendation> findByUserIdAndStockSymbolAndIsDeletedFalse(
        Long userId, String stockSymbol
    );
}