package com.financial.platform.mapper;

import com.financial.platform.dto.response.TransactionResponse;
import com.financial.platform.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction t) {
        if (t == null) return null;

        TransactionResponse.TransactionResponseBuilder builder = TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .type(t.getType())
                .transactionDate(t.getTransactionDate())
                .description(t.getDescription())
                .notes(t.getNotes())
                .merchantName(t.getMerchantName())
                .referenceNumber(t.getReferenceNumber())
                .isRecurring(t.getIsRecurring())
                .isAnomaly(t.getIsAnomaly())
                .createdAt(t.getCreatedAt());

        if (t.getAccount() != null) {
            builder.accountId(t.getAccount().getId())
                   .accountName(t.getAccount().getName());
        }

        if (t.getToAccount() != null) {
            builder.toAccountId(t.getToAccount().getId())
                   .toAccountName(t.getToAccount().getName());
        }

        if (t.getCategory() != null) {
            builder.categoryId(t.getCategory().getId())
                   .categoryName(t.getCategory().getName())
                   .categoryIcon(t.getCategory().getIcon());
        }

        return builder.build();
    }
}