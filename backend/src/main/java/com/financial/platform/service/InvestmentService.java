package com.financial.platform.service;

import com.financial.platform.dto.request.InvestmentRequest;
import com.financial.platform.dto.response.InvestmentResponse;

import java.util.List;

public interface InvestmentService {
    List<InvestmentResponse> getAllInvestments();
    InvestmentResponse getInvestment(Long id);
    InvestmentResponse createInvestment(InvestmentRequest request);
    InvestmentResponse updateInvestment(Long id, InvestmentRequest request);
    void deleteInvestment(Long id);
}