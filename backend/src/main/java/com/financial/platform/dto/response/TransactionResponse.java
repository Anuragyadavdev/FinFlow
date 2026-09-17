package com.financial.platform.dto.response;

import com.financial.platform.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private Transaction.TransactionType type;
    private Long accountId;
    private String accountName;
    private Long toAccountId;
    private String toAccountName;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private LocalDateTime transactionDate;
    private String description;
    private String notes;
    private String merchantName;
    private String referenceNumber;
    private Boolean isRecurring;
    private Boolean isAnomaly;
    private LocalDateTime createdAt;
}