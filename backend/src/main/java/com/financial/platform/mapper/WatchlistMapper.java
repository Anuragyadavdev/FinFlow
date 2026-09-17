package com.financial.platform.mapper;

import com.financial.platform.dto.response.WatchlistResponse;
import com.financial.platform.entity.Watchlist;
import org.springframework.stereotype.Component;

@Component
public class WatchlistMapper {

    public WatchlistResponse toResponse(Watchlist w) {
        if (w == null) return null;
        return WatchlistResponse.builder()
                .id(w.getId())
                .stockSymbol(w.getStockSymbol())
                .companyName(w.getCompanyName())
                .targetPrice(w.getTargetPrice())
                .notes(w.getNotes())
                .alertEnabled(w.getAlertEnabled())
                .build();
    }
}