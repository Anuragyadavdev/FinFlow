package com.financial.platform.mapper;

import com.financial.platform.dto.request.AccountRequest;
import com.financial.platform.dto.response.AccountResponse;
import com.financial.platform.entity.Account;
import com.financial.platform.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AccountMapper {

    public AccountResponse toResponse(Account account) {
        if (account == null) return null;

        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .type(account.getType())
                .balance(account.getBalance())
                .openingBalance(account.getOpeningBalance())
                .openingBalanceDate(account.getOpeningBalanceDate())
                .currency(account.getCurrency())
                .accountNumber(account.getAccountNumber())
                .bankName(account.getBankName())
                .ifscCode(account.getIfscCode())
                .isActive(account.getIsActive())
                .description(account.getDescription())
                .createdAt(account.getCreatedAt())
                .build();
    }

    public Account toEntity(AccountRequest request, User user) {
        BigDecimal opening = request.getOpeningBalance() != null
                ? request.getOpeningBalance() : BigDecimal.ZERO;

        return Account.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType())
                .balance(opening)
                .openingBalance(opening)
                .openingBalanceDate(request.getOpeningBalanceDate())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .description(request.getDescription())
                .currency(user.getCurrency())
                .isActive(true)
                .build();
    }

    public void updateEntity(Account account, AccountRequest request) {
        account.setName(request.getName());
        account.setType(request.getType());
        account.setAccountNumber(request.getAccountNumber());
        account.setBankName(request.getBankName());
        account.setIfscCode(request.getIfscCode());
        account.setDescription(request.getDescription());
    }
}