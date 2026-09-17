package com.financial.platform.controller;

import com.financial.platform.dto.request.WatchlistRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.WatchlistResponse;
import com.financial.platform.service.WatchlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<WatchlistResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(watchlistService.getAll()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WatchlistResponse>> add(
            @Valid @RequestBody WatchlistRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Added to watchlist",
                        watchlistService.add(request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {
        watchlistService.remove(id);
        return ResponseEntity.ok(ApiResponse.success("Removed", null));
    }
}