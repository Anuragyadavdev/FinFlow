package com.financial.platform.service.impl;

import com.financial.platform.dto.request.WatchlistRequest;
import com.financial.platform.dto.response.WatchlistResponse;
import com.financial.platform.dto.response.stock.StockQuote;
import com.financial.platform.entity.User;
import com.financial.platform.entity.Watchlist;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.WatchlistMapper;
import com.financial.platform.repository.WatchlistRepository;
import com.financial.platform.service.StockService;
import com.financial.platform.service.WatchlistService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final WatchlistMapper watchlistMapper;
    private final StockService stockService;

    @Override
    @Transactional(readOnly = true)
    public List<WatchlistResponse> getAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        return watchlistRepository.findByUserIdAndIsDeletedFalse(userId)
                .stream()
                .map(w -> enrichWithLivePrice(watchlistMapper.toResponse(w)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WatchlistResponse add(WatchlistRequest request) {
        User user = SecurityUtils.getCurrentUser();
        String symbol = request.getStockSymbol().trim().toUpperCase();

        if (watchlistRepository.existsByUserIdAndStockSymbolAndIsDeletedFalse(
                user.getId(), symbol)) {
            throw new BadRequestException("Stock already in watchlist");
        }

        Watchlist w = Watchlist.builder()
                .user(user)
                .stockSymbol(symbol)
                .companyName(request.getCompanyName())
                .targetPrice(request.getTargetPrice())
                .notes(request.getNotes())
                .alertEnabled(Boolean.TRUE.equals(request.getAlertEnabled()))
                .build();

        Watchlist saved = watchlistRepository.save(w);
        return enrichWithLivePrice(watchlistMapper.toResponse(saved));
    }

    @Override
    @Transactional
    public void remove(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Watchlist w = watchlistRepository
                .findByUserIdAndStockSymbolAndIsDeletedFalse(userId, null)
                .orElse(null);   // placeholder — we use findById below

        // Simpler: fetch by id and verify ownership
        Watchlist wl = watchlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist", id));

        if (!wl.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Watchlist", id);
        }
        wl.setIsDeleted(true);
        watchlistRepository.save(wl);
    }

    // ----------------------------------------------------------

    private WatchlistResponse enrichWithLivePrice(WatchlistResponse r) {
        try {
            StockQuote q = stockService.getQuote(r.getStockSymbol());
            if (q != null) {
                r.setCurrentPrice(q.getCurrentPrice());
                r.setChange(q.getChange());
                r.setChangePercent(q.getChangePercent());
                if (r.getCompanyName() == null) {
                    r.setCompanyName(q.getShortName());
                }
            }
        } catch (Exception ignored) { }
        return r;
    }
}