package com.financial.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "watchlist",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "stock_symbol"})
)
public class Watchlist extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "stock_symbol", nullable = false, length = 20)
    private String stockSymbol;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "target_price", precision = 19, scale = 2)
    private BigDecimal targetPrice;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "alert_enabled")
    private Boolean alertEnabled = false;
}