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
@Table(name = "recommendations")
public class Recommendation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "stock_symbol", length = 20)
    private String stockSymbol;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "recommendation_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private RecommendationType recommendationType;

    @Column(name = "reasoning", columnDefinition = "TEXT")
    private String reasoning;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "target_price", precision = 19, scale = 2)
    private BigDecimal targetPrice;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "time_horizon", length = 50)
    private String timeHorizon;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "is_dismissed")
    private Boolean isDismissed = false;

    public enum RecommendationType {
        BUY,
        HOLD,
        SELL,
        WATCH
    }
}