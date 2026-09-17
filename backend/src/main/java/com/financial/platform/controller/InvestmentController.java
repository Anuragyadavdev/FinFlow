package com.financial.platform.controller;

import com.financial.platform.dto.request.InvestmentRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.InvestmentResponse;
import com.financial.platform.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentService investmentService;

    @GetMapping
    @PreAuthorize("hasAuthority('INVESTMENT_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<InvestmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                investmentService.getAllInvestments()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVESTMENT_VIEW_OWN')")
    public ResponseEntity<ApiResponse<InvestmentResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                investmentService.getInvestment(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVESTMENT_CREATE')")
    public ResponseEntity<ApiResponse<InvestmentResponse>> create(
            @Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Investment added",
                        investmentService.createInvestment(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INVESTMENT_UPDATE_OWN')")
    public ResponseEntity<ApiResponse<InvestmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Investment updated",
                investmentService.updateInvestment(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INVESTMENT_DELETE_OWN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        investmentService.deleteInvestment(id);
        return ResponseEntity.ok(ApiResponse.success("Investment deleted", null));
    }
}