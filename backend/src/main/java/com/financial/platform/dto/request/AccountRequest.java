package com.financial.platform.dto.request;

import com.financial.platform.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Account type is required")
    private Account.AccountType type;

    private BigDecimal openingBalance;

    private LocalDate openingBalanceDate;

    @Size(max = 50)
    private String accountNumber;

    @Size(max = 100)
    private String bankName;

    @Size(max = 20)
    private String ifscCode;

    @Size(max = 500)
    private String description;
}