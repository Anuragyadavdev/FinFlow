package com.financial.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_preferences")
public class UserPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "theme")
    private String theme = "dark";

    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications")
    private Boolean pushNotifications = true;

    @Column(name = "budget_alerts")
    private Boolean budgetAlerts = true;

    @Column(name = "anomaly_alerts")
    private Boolean anomalyAlerts = true;

    @Column(name = "goal_alerts")
    private Boolean goalAlerts = true;

    @Column(name = "weekly_summary")
    private Boolean weeklySummary = false;

    @Column(name = "monthly_report")
    private Boolean monthlyReport = true;

    @Column(name = "default_currency")
    private String defaultCurrency = "INR";

    @Column(name = "risk_tolerance")
    private String riskTolerance = "MODERATE";
}