package com.cloudcampus.platform.subscription;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private SubscriptionPlanStatus status = SubscriptionPlanStatus.ACTIVE;

    @Column(nullable = false)
    private int maxSchools;

    @Column(nullable = false)
    private int maxStudents;

    @Column(nullable = false)
    private int maxStaff;

    @Column(nullable = false)
    private long monthlyPriceCents;

    @Column(nullable = false)
    private long annualPriceCents;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected SubscriptionPlan() {
    }

    public SubscriptionPlan(
            String code,
            String name,
            String description,
            int maxSchools,
            int maxStudents,
            int maxStaff,
            long monthlyPriceCents,
            long annualPriceCents,
            String currency
    ) {
        this.code = normalizeCode(code);
        this.name = name.trim();
        this.description = blankToNull(description);
        this.maxSchools = maxSchools;
        this.maxStudents = maxStudents;
        this.maxStaff = maxStaff;
        this.monthlyPriceCents = monthlyPriceCents;
        this.annualPriceCents = annualPriceCents;
        this.currency = currency.trim().toUpperCase(Locale.ROOT);
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void update(
            String name,
            String description,
            int maxSchools,
            int maxStudents,
            int maxStaff,
            long monthlyPriceCents,
            long annualPriceCents,
            String currency,
            SubscriptionPlanStatus status
    ) {
        this.name = name.trim();
        this.description = blankToNull(description);
        this.maxSchools = maxSchools;
        this.maxStudents = maxStudents;
        this.maxStaff = maxStaff;
        this.monthlyPriceCents = monthlyPriceCents;
        this.annualPriceCents = annualPriceCents;
        this.currency = currency.trim().toUpperCase(Locale.ROOT);
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public SubscriptionPlanStatus getStatus() {
        return status;
    }

    public int getMaxSchools() {
        return maxSchools;
    }

    public int getMaxStudents() {
        return maxStudents;
    }

    public int getMaxStaff() {
        return maxStaff;
    }

    public long getMonthlyPriceCents() {
        return monthlyPriceCents;
    }

    public long getAnnualPriceCents() {
        return annualPriceCents;
    }

    public String getCurrency() {
        return currency;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    private String normalizeCode(String rawCode) {
        return rawCode.trim().toUpperCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
