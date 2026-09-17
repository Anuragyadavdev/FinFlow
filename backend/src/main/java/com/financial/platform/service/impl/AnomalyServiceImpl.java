package com.financial.platform.service.impl;

import com.financial.platform.dto.response.anomaly.AnomalyResponse;
import com.financial.platform.entity.*;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.AnomalyMapper;
import com.financial.platform.repository.AnomalyRepository;
import com.financial.platform.repository.TransactionRepository;
import com.financial.platform.service.AnomalyService;
import com.financial.platform.service.NotificationService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnomalyServiceImpl implements AnomalyService {

    private final AnomalyRepository anomalyRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final AnomalyMapper anomalyMapper;

    private static final double Z_SCORE_THRESHOLD = 2.0;         // 2σ
    private static final int DUPLICATE_WINDOW_HOURS = 24;
    private static final int MIN_HISTORY_FOR_Z = 5;               // need ≥5 past txns
    private static final double CATEGORY_SPIKE_MULTIPLIER = 2.0;  // 2× weekly avg
    private static final int UNUSUAL_DAILY_COUNT = 8;             // txns/day
    private static final double MOM_INCREASE_PCT = 50.0;
    private static final BigDecimal MOM_MIN_AMOUNT = BigDecimal.valueOf(2000);

    @Override
    @Transactional(readOnly = true)
    public Page<AnomalyResponse> listAnomalies(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        return anomalyRepository
                .findByUserIdAndIsDeletedFalse(userId,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(anomalyMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AnomalyResponse getAnomaly(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Anomaly a = anomalyRepository.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Anomaly", id));
        return anomalyMapper.toResponse(a);
    }

    @Override
    @Transactional
    public AnomalyResponse review(Long id, Boolean isFalsePositive, String notes) {
        Long userId = SecurityUtils.getCurrentUserId();
        Anomaly a = anomalyRepository.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Anomaly", id));

        a.setIsReviewed(true);
        a.setIsFalsePositive(isFalsePositive);
        a.setReviewedAt(LocalDateTime.now());
        a.setReviewNotes(notes);

        return anomalyMapper.toResponse(anomalyRepository.save(a));
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreviewed() {
        return anomalyRepository
                .countByUserIdAndIsReviewedFalseAndIsDeletedFalse(
                        SecurityUtils.getCurrentUserId());
    }

    // ============================================================
    // DETECTION ENTRY POINT
    // ============================================================

    @Override
    @Transactional
    public int runDetectionForCurrentUser() {
        User user = SecurityUtils.getCurrentUser();
        int created = 0;

        // Analyze transactions from the last 30 days
        LocalDateTime since = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        List<Transaction> recent = transactionRepository
                .findByUserIdAndDateRange(user.getId(), since, now);

        for (Transaction txn : recent) {
            if (Boolean.TRUE.equals(txn.getIsAnomaly())) continue;   // already flagged

            Anomaly a = detectUnusualAmount(user, txn);
            if (a == null) a = detectCategorySpike(user, txn);
            if (a == null) a = detectUnusualFrequency(user, txn);
            if (a == null) a = detectDuplicate(user, txn);

            if (a != null) {
                anomalyRepository.save(a);
                txn.setIsAnomaly(true);
                transactionRepository.save(txn);
                notify(user, a);
                created++;
            }
        }

        log.info("Anomaly detection completed for user {} — {} new anomalies",
                user.getId(), created);
        return created;
    }

    // ============================================================
    // DETECTORS
    // ============================================================

    /**
     * Unusual amount: |txn| > mean + 2σ for its category (needs ≥5 samples).
     */
    private Anomaly detectUnusualAmount(User user, Transaction txn) {
        if (txn.getCategory() == null) return null;
        if (txn.getType() != Transaction.TransactionType.EXPENSE) return null;

        LocalDateTime before = txn.getTransactionDate().minusDays(1);

        BigDecimal mean = transactionRepository.getCategoryAverageBefore(
                user.getId(), txn.getCategory().getId(), before);
        BigDecimal std  = transactionRepository.getCategoryStdDevBefore(
                user.getId(), txn.getCategory().getId(), before);

        if (mean == null || std == null) return null;
        if (mean.compareTo(BigDecimal.ZERO) <= 0) return null;
        if (std.compareTo(BigDecimal.ZERO) <= 0) return null;

        // Sample-size guard
        long samples = transactionRepository.countByCategoryAndPeriod(
                user.getId(), txn.getCategory().getId(),
                LocalDate.now().minusDays(180).atStartOfDay(), before);
        if (samples < MIN_HISTORY_FOR_Z) return null;

        double z = txn.getAmount().subtract(mean)
                .divide(std, 4, RoundingMode.HALF_UP)
                .doubleValue();

        if (z < Z_SCORE_THRESHOLD) return null;

        BigDecimal devPct = txn.getAmount().subtract(mean)
                .multiply(BigDecimal.valueOf(100))
                .divide(mean, 2, RoundingMode.HALF_UP);

        return Anomaly.builder()
                .user(user)
                .transaction(txn)
                .anomalyType(Anomaly.AnomalyType.UNUSUAL_AMOUNT)
                .severity(z >= 3.0 ? Anomaly.Severity.HIGH : Anomaly.Severity.MEDIUM)
                .description(String.format(
                        "₹%,.2f in %s is %.1fσ above your average (₹%,.2f). Please review this transaction.",
                        txn.getAmount(),
                        txn.getCategory().getName(),
                        z, mean))
                .expectedValue(mean)
                .actualValue(txn.getAmount())
                .deviationPercentage(devPct)
                .detectionMethod("Z_SCORE")
                .build();
    }

    /**
     * Category spike: this week's category total > 2× the 4-week weekly average.
     */
    private Anomaly detectCategorySpike(User user, Transaction txn) {
        if (txn.getCategory() == null) return null;
        if (txn.getType() != Transaction.TransactionType.EXPENSE) return null;

        LocalDate weekStart = txn.getTransactionDate().toLocalDate()
                .minusDays(txn.getTransactionDate().getDayOfWeek().getValue() - 1);
        LocalDateTime ws = weekStart.atStartOfDay();
        LocalDateTime we = ws.plusDays(7).minusSeconds(1);

        BigDecimal thisWeek = transactionRepository.sumByCategoryTypeAndRange(
                user.getId(), txn.getCategory().getId(),
                Transaction.TransactionType.EXPENSE, ws, we);

        // Previous 4 weeks average
        LocalDateTime prevEnd = ws.minusSeconds(1);
        LocalDateTime prevStart = prevEnd.minusWeeks(4);

        BigDecimal prevTotal = transactionRepository.sumByCategoryTypeAndRange(
                user.getId(), txn.getCategory().getId(),
                Transaction.TransactionType.EXPENSE, prevStart, prevEnd);

        BigDecimal weeklyAvg = prevTotal.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
        if (weeklyAvg.compareTo(BigDecimal.ZERO) <= 0) return null;

        BigDecimal ratio = thisWeek.divide(weeklyAvg, 2, RoundingMode.HALF_UP);
        if (ratio.doubleValue() < CATEGORY_SPIKE_MULTIPLIER) return null;

        BigDecimal devPct = ratio.subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100));

        return Anomaly.builder()
                .user(user)
                .transaction(txn)
                .anomalyType(Anomaly.AnomalyType.CATEGORY_SPIKE)
                .severity(Anomaly.Severity.MEDIUM)
                .description(String.format(
                        "%s spending this week (₹%,.2f) is %.1fx your 4-week weekly average (₹%,.2f).",
                        txn.getCategory().getName(), thisWeek, ratio, weeklyAvg))
                .expectedValue(weeklyAvg)
                .actualValue(thisWeek)
                .deviationPercentage(devPct)
                .detectionMethod("WEEKLY_SPIKE")
                .build();
    }

    /**
     * Unusual frequency: too many txns in a single day.
     */
    private Anomaly detectUnusualFrequency(User user, Transaction txn) {
        LocalDate day = txn.getTransactionDate().toLocalDate();
        long count = transactionRepository.countInRange(
                user.getId(), day.atStartOfDay(), day.atTime(LocalTime.MAX));

        if (count < UNUSUAL_DAILY_COUNT) return null;

        return Anomaly.builder()
                .user(user)
                .transaction(txn)
                .anomalyType(Anomaly.AnomalyType.UNUSUAL_FREQUENCY)
                .severity(Anomaly.Severity.LOW)
                .description(String.format(
                        "You recorded %d transactions on %s — unusually high activity.",
                        count, day))
                .actualValue(BigDecimal.valueOf(count))
                .detectionMethod("DAILY_COUNT")
                .build();
    }

    /**
     * Duplicate: same amount + same account within 24 hours.
     */
    private Anomaly detectDuplicate(User user, Transaction txn) {
        LocalDateTime from = txn.getTransactionDate().minusHours(DUPLICATE_WINDOW_HOURS);
        LocalDateTime to = txn.getTransactionDate().plusHours(DUPLICATE_WINDOW_HOURS);

        List<Transaction> similar = transactionRepository.findPotentialDuplicates(
                user.getId(), txn.getAmount(), txn.getAccount().getId(), from, to);

        // Remove itself
        similar.removeIf(t -> t.getId().equals(txn.getId()));
        if (similar.isEmpty()) return null;

        // Only flag once — use smallest ID as the "owner"
        Transaction other = similar.get(0);
        if (txn.getId() > other.getId()) return null;

        return Anomaly.builder()
                .user(user)
                .transaction(txn)
                .anomalyType(Anomaly.AnomalyType.DUPLICATE_TRANSACTION)
                .severity(Anomaly.Severity.MEDIUM)
                .description(String.format(
                        "Possible duplicate: ₹%,.2f charged twice within %d hours.",
                        txn.getAmount(), DUPLICATE_WINDOW_HOURS))
                .actualValue(txn.getAmount())
                .expectedValue(txn.getAmount())
                .detectionMethod("DUPLICATE_WINDOW")
                .build();
    }

    // ============================================================
    // NOTIFICATION
    // ============================================================

    private void notify(User user, Anomaly a) {
        Notification.Severity severity = switch (a.getSeverity()) {
            case CRITICAL, HIGH -> Notification.Severity.CRITICAL;
            case MEDIUM -> Notification.Severity.WARNING;
            case LOW -> Notification.Severity.INFO;
        };

        notificationService.create(
                user.getId(),
                "Unusual Activity Detected",
                a.getDescription() + " Tap to review.",
                Notification.NotificationType.ANOMALY_DETECTED,
                severity);
    }

    // Helper for scheduled job later
    @SuppressWarnings("unused")
    private long daysBetween(LocalDateTime a, LocalDateTime b) {
        return ChronoUnit.DAYS.between(a, b);
    }
}