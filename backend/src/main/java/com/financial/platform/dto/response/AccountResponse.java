package com.financial.platform.dto.response;

import com.financial.platform.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private Long id;
    private String name;
    private Account.AccountType type;
    private BigDecimal balance;
    private BigDecimal openingBalance;
    private LocalDate openingBalanceDate;
    private String currency;
    private String accountNumber;
    private String bankName;
    private String ifscCode;
    private Boolean isActive;
    private String description;
    private LocalDateTime createdAt;
}