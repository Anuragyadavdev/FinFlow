package com.financial.platform.controller;

import com.financial.platform.dto.request.AccountRequest;
import com.financial.platform.dto.response.AccountResponse;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAuthority('ACCOUNT_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAllAccounts()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNT_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AccountResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccount(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ACCOUNT_CREATE')")
    public ResponseEntity<ApiResponse<AccountResponse>> create(
            @Valid @RequestBody AccountRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNT_UPDATE_OWN')")
    public ResponseEntity<ApiResponse<AccountResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Account updated", accountService.updateAccount(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNT_DELETE_OWN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Account deleted", null));
    }

    @GetMapping("/total-balance")
    @PreAuthorize("hasAuthority('ACCOUNT_VIEW_OWN')")
    public ResponseEntity<ApiResponse<BigDecimal>> totalBalance() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getTotalBalance()));
    }
}