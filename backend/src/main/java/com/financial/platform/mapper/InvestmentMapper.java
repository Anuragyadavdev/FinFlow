package com.financial.platform.mapper;

import com.financial.platform.dto.request.InvestmentRequest;
import com.financial.platform.dto.response.InvestmentResponse;
import com.financial.platform.entity.Investment;
import com.financial.platform.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class InvestmentMapper {

    public InvestmentResponse toResponse(Investment inv) {
        if (inv == null) return null;

        BigDecimal invested = inv.getInvestedAmount() != null
                ? inv.getInvestedAmount() : BigDecimal.ZERO;
        BigDecimal current = inv.getCurrentValue() != null
                ? inv.getCurrentValue() : invested;

        BigDecimal pl = current.subtract(invested);
        double plPct = 0.0;
        if (invested.compareTo(BigDecimal.ZERO) > 0) {
            plPct = pl.multiply(BigDecimal.valueOf(100))
                    .divide(invested, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return InvestmentResponse.builder()
                .id(inv.getId())
                .stockSymbol(inv.getStockSymbol())
                .companyName(inv.getCompanyName())
                .investmentType(inv.getInvestmentType())
                .purchaseDate(inv.getPurchaseDate())
                .purchasePrice(inv.getPurchasePrice())
                .quantity(inv.getQuantity())
                .currentPrice(inv.getCurrentPrice())
                .investedAmount(invested)
                .currentValue(current)
                .profitLoss(pl)
                .profitLossPercentage(plPct)
                .sector(inv.getSector())
                .isActive(inv.getIsActive())
                .lastPriceUpdate(inv.getLastPriceUpdate())
                .notes(inv.getNotes())
                .build();
    }

    public Investment toEntity(InvestmentRequest request, User user) {
        BigDecimal invested = request.getPurchasePrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));
        BigDecimal currentPrice = request.getCurrentPrice() != null
                ? request.getCurrentPrice() : request.getPurchasePrice();
        BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        return Investment.builder()
                .user(user)
                .stockSymbol(request.getStockSymbol())
                .companyName(request.getCompanyName())
                .investmentType(request.getInvestmentType())
                .purchaseDate(request.getPurchaseDate())
                .purchasePrice(request.getPurchasePrice())
                .quantity(request.getQuantity())
                .currentPrice(currentPrice)
                .investedAmount(invested)
                .currentValue(currentValue)
                .sector(request.getSector())
                .notes(request.getNotes())
                .isActive(true)
                .lastPriceUpdate(request.getPurchaseDate())
                .build();
    }

    public void updateEntity(Investment inv, InvestmentRequest request) {
        inv.setStockSymbol(request.getStockSymbol());
        inv.setCompanyName(request.getCompanyName());
        inv.setInvestmentType(request.getInvestmentType());
        inv.setPurchaseDate(request.getPurchaseDate());
        inv.setPurchasePrice(request.getPurchasePrice());
        inv.setQuantity(request.getQuantity());
        inv.setSector(request.getSector());
        inv.setNotes(request.getNotes());

        BigDecimal invested = request.getPurchasePrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));
        inv.setInvestedAmount(invested);

        BigDecimal currentPrice = request.getCurrentPrice() != null
                ? request.getCurrentPrice() : request.getPurchasePrice();
        inv.setCurrentPrice(currentPrice);
        inv.setCurrentValue(currentPrice.multiply(BigDecimal.valueOf(request.getQuantity())));
    }
}