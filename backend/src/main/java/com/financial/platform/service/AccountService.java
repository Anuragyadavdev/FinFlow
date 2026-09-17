package com.financial.platform.service;

import com.financial.platform.dto.request.AccountRequest;
import com.financial.platform.dto.response.AccountResponse;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {

    List<AccountResponse> getAllAccounts();

    AccountResponse getAccount(Long id);

    AccountResponse createAccount(AccountRequest request);

    AccountResponse updateAccount(Long id, AccountRequest request);

    void deleteAccount(Long id);

    BigDecimal getTotalBalance();
}