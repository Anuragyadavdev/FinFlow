package com.financial.platform.service;

import com.financial.platform.dto.request.WatchlistRequest;
import com.financial.platform.dto.response.WatchlistResponse;

import java.util.List;

public interface WatchlistService {
    List<WatchlistResponse> getAll();
    WatchlistResponse add(WatchlistRequest request);
    void remove(Long id);
}