package com.financial.platform.service.impl;

import com.financial.platform.dto.request.InvestmentRequest;
import com.financial.platform.dto.response.InvestmentResponse;
import com.financial.platform.entity.Investment;
import com.financial.platform.entity.User;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.InvestmentMapper;
import com.financial.platform.repository.InvestmentRepository;
import com.financial.platform.service.InvestmentService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvestmentServiceImpl implements InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final InvestmentMapper investmentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentResponse> getAllInvestments() {
        Long userId = SecurityUtils.getCurrentUserId();
        return investmentRepository.findByUserIdAndIsDeletedFalse(userId)
                .stream()
                .map(investmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvestmentResponse getInvestment(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Investment inv = investmentRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment", id));
        return investmentMapper.toResponse(inv);
    }

    @Override
    @Transactional
    public InvestmentResponse createInvestment(InvestmentRequest request) {
        User user = SecurityUtils.getCurrentUser();
        Investment inv = investmentMapper.toEntity(request, user);
        return investmentMapper.toResponse(investmentRepository.save(inv));
    }

    @Override
    @Transactional
    public InvestmentResponse updateInvestment(Long id, InvestmentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Investment inv = investmentRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment", id));
        investmentMapper.updateEntity(inv, request);
        return investmentMapper.toResponse(investmentRepository.save(inv));
    }

    @Override
    @Transactional
    public void deleteInvestment(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Investment inv = investmentRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment", id));
        inv.setIsDeleted(true);
        inv.setIsActive(false);
        investmentRepository.save(inv);
    }
}