package com.financial.platform.repository;

import com.financial.platform.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUserIdAndIsDeletedFalse(Long userId);

    Optional<Watchlist> findByUserIdAndStockSymbolAndIsDeletedFalse(Long userId, String stockSymbol);

    boolean existsByUserIdAndStockSymbolAndIsDeletedFalse(Long userId, String stockSymbol);

    void deleteByUserIdAndStockSymbol(Long userId, String stockSymbol);
}