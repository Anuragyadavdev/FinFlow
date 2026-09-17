package com.financial.platform.controller;

import com.financial.platform.constants.AppConstants;
import com.financial.platform.dto.request.TransactionRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.TransactionResponse;
import com.financial.platform.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @PreAuthorize("hasAuthority('TRANSACTION_VIEW_OWN')")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getAll(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getTransactions(page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TRANSACTION_VIEW_OWN')")
    public ResponseEntity<ApiResponse<TransactionResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getTransaction(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('TRANSACTION_CREATE')")
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created",
                        transactionService.createTransaction(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TRANSACTION_UPDATE_OWN')")
    public ResponseEntity<ApiResponse<TransactionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Transaction updated",
                transactionService.updateTransaction(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TRANSACTION_DELETE_OWN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted", null));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAuthority('TRANSACTION_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> recent(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getRecentTransactions(limit)));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAuthority('TRANSACTION_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> byRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getByDateRange(from, to)));
    }
}