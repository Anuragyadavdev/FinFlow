package com.financial.platform.service.impl;

import com.financial.platform.dto.request.AccountRequest;
import com.financial.platform.dto.response.AccountResponse;
import com.financial.platform.entity.Account;
import com.financial.platform.entity.User;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.AccountMapper;
import com.financial.platform.repository.AccountRepository;
import com.financial.platform.service.AccountService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts() {
        Long userId = SecurityUtils.getCurrentUserId();
        return accountRepository.findByUserIdAndIsDeletedFalse(userId)
                .stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccount(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Account account = accountRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", id));
        return accountMapper.toResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        User user = SecurityUtils.getCurrentUser();

        if (accountRepository.existsByUserIdAndNameAndIsDeletedFalse(
                user.getId(), request.getName())) {
            throw new BadRequestException("Account with this name already exists");
        }

        Account account = accountMapper.toEntity(request, user);
        Account saved = accountRepository.save(account);
        log.info("Created account {} for user {}", saved.getId(), user.getId());
        return accountMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(Long id, AccountRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Account account = accountRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", id));

        accountMapper.updateEntity(account, request);
        Account updated = accountRepository.save(account);
        return accountMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Account account = accountRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", id));

        account.setIsDeleted(true);
        account.setIsActive(false);
        accountRepository.save(account);
        log.info("Soft-deleted account {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalBalance() {
        Long userId = SecurityUtils.getCurrentUserId();
        return accountRepository.getTotalBalanceByUserId(userId);
    }
}