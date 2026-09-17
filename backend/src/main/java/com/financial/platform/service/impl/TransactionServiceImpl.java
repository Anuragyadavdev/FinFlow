package com.financial.platform.service.impl;

import com.financial.platform.dto.request.TransactionRequest;
import com.financial.platform.dto.response.TransactionResponse;
import com.financial.platform.entity.*;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.TransactionMapper;
import com.financial.platform.repository.*;
import com.financial.platform.service.TransactionService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(int page, int size,
                                                     String sortBy, String sortDir) {
        Long userId = SecurityUtils.getCurrentUserId();
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return transactionRepository
                .findByUserIdAndIsDeletedFalse(userId, pageable)
                .map(transactionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Transaction txn = transactionRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        return transactionMapper.toResponse(txn);
    }

    @Override
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = SecurityUtils.getCurrentUser();

        Account account = accountRepository
                .findByIdAndUserIdAndIsDeletedFalse(request.getAccountId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account", request.getAccountId()));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category", request.getCategoryId()));
        }

        Account toAccount = null;
        if (request.getType() == Transaction.TransactionType.TRANSFER) {
            if (request.getToAccountId() == null) {
                throw new BadRequestException("toAccountId is required for TRANSFER");
            }
            if (request.getToAccountId().equals(request.getAccountId())) {
                throw new BadRequestException("Cannot transfer to the same account");
            }
            toAccount = accountRepository
                    .findByIdAndUserIdAndIsDeletedFalse(request.getToAccountId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "To Account", request.getToAccountId()));
        }

        Transaction txn = Transaction.builder()
                .user(user)
                .account(account)
                .toAccount(toAccount)
                .category(category)
                .amount(request.getAmount())
                .type(request.getType())
                .transactionDate(request.getTransactionDate())
                .description(request.getDescription())
                .notes(request.getNotes())
                .merchantName(request.getMerchantName())
                .referenceNumber(request.getReferenceNumber())
                .tags(request.getTags())
                .isRecurring(false)
                .isReviewed(false)
                .isAnomaly(false)
                .build();

        applyBalanceEffect(account, toAccount, txn.getAmount(), txn.getType());

        Transaction saved = transactionRepository.save(txn);
        accountRepository.save(account);
        if (toAccount != null) accountRepository.save(toAccount);

        log.info("Created transaction {} for user {}", saved.getId(), user.getId());
        return transactionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Transaction txn = transactionRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));

        // Reverse old effect
        reverseBalanceEffect(txn.getAccount(), txn.getToAccount(),
                txn.getAmount(), txn.getType());

        Account account = accountRepository
                .findByIdAndUserIdAndIsDeletedFalse(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account", request.getAccountId()));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category", request.getCategoryId()));
        }

        Account toAccount = null;
        if (request.getType() == Transaction.TransactionType.TRANSFER) {
            if (request.getToAccountId() == null) {
                throw new BadRequestException("toAccountId is required for TRANSFER");
            }
            toAccount = accountRepository
                    .findByIdAndUserIdAndIsDeletedFalse(request.getToAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "To Account", request.getToAccountId()));
        }

        txn.setAccount(account);
        txn.setToAccount(toAccount);
        txn.setCategory(category);
        txn.setAmount(request.getAmount());
        txn.setType(request.getType());
        txn.setTransactionDate(request.getTransactionDate());
        txn.setDescription(request.getDescription());
        txn.setNotes(request.getNotes());
        txn.setMerchantName(request.getMerchantName());
        txn.setReferenceNumber(request.getReferenceNumber());
        txn.setTags(request.getTags());

        applyBalanceEffect(account, toAccount, txn.getAmount(), txn.getType());

        Transaction updated = transactionRepository.save(txn);
        accountRepository.save(account);
        if (toAccount != null) accountRepository.save(toAccount);

        return transactionMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Transaction txn = transactionRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));

        reverseBalanceEffect(txn.getAccount(), txn.getToAccount(),
                txn.getAmount(), txn.getType());

        txn.setIsDeleted(true);
        transactionRepository.save(txn);
        accountRepository.save(txn.getAccount());
        if (txn.getToAccount() != null) accountRepository.save(txn.getToAccount());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(int limit) {
        Long userId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(0, limit,
                Sort.by("transactionDate").descending());
        return transactionRepository
                .findRecentTransactions(userId, pageable)
                .getContent()
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getByDateRange(LocalDateTime from, LocalDateTime to) {
        Long userId = SecurityUtils.getCurrentUserId();
        return transactionRepository.findByUserIdAndDateRange(userId, from, to)
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------- BALANCE HELPERS ----------------------

    private void applyBalanceEffect(Account from, Account to,
                                    BigDecimal amount, Transaction.TransactionType type) {
        switch (type) {
            case INCOME   -> from.setBalance(from.getBalance().add(amount));
            case EXPENSE  -> from.setBalance(from.getBalance().subtract(amount));
            case TRANSFER -> {
                from.setBalance(from.getBalance().subtract(amount));
                to.setBalance(to.getBalance().add(amount));
            }
        }
    }

    private void reverseBalanceEffect(Account from, Account to,
                                      BigDecimal amount, Transaction.TransactionType type) {
        switch (type) {
            case INCOME   -> from.setBalance(from.getBalance().subtract(amount));
            case EXPENSE  -> from.setBalance(from.getBalance().add(amount));
            case TRANSFER -> {
                from.setBalance(from.getBalance().add(amount));
                to.setBalance(to.getBalance().subtract(amount));
            }
        }
    }
}