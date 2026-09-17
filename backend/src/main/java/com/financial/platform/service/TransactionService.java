package com.financial.platform.service;

import com.financial.platform.dto.request.TransactionRequest;
import com.financial.platform.dto.response.TransactionResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {

    Page<TransactionResponse> getTransactions(int page, int size, String sortBy, String sortDir);

    TransactionResponse getTransaction(Long id);

    TransactionResponse createTransaction(TransactionRequest request);

    TransactionResponse updateTransaction(Long id, TransactionRequest request);

    void deleteTransaction(Long id);

    List<TransactionResponse> getRecentTransactions(int limit);

    List<TransactionResponse> getByDateRange(LocalDateTime from, LocalDateTime to);
}