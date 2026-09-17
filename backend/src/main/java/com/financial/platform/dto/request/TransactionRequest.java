package com.financial.platform.dto.request;

import com.financial.platform.entity.Transaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private Transaction.TransactionType type;

    @NotNull(message = "Account is required")
    private Long accountId;

    private Long toAccountId;

    private Long categoryId;

    @NotNull(message = "Transaction date is required")
    private LocalDateTime transactionDate;

    @Size(max = 500)
    private String description;

    private String notes;

    @Size(max = 200)
    private String merchantName;

    @Size(max = 100)
    private String referenceNumber;

    @Size(max = 500)
    private String tags;
}