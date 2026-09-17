package com.financial.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "investments")
public class Investment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "stock_symbol", length = 20)
    private String stockSymbol;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "investment_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private InvestmentType investmentType;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "purchase_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "current_price", precision = 19, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "invested_amount", precision = 19, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "current_value", precision = 19, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "sector", length = 50)
    private String sector;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_price_update")
    private LocalDate lastPriceUpdate;

    public enum InvestmentType {
        STOCK,
        MUTUAL_FUND,
        FIXED_DEPOSIT,
        BOND,
        GOLD,
        REAL_ESTATE,
        CRYPTO,
        OTHER
    }
}