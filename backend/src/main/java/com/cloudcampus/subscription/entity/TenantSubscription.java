package com.cloudcampus.subscription.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Records the active subscription plan for a tenant (CC-0308).
 * One row per tenant (UNIQUE on tenant_id). Replaced in-place on plan change.
 */
@Entity
@Table(name = "tenant_subscriptions")
public class TenantSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_code", nullable = false, length = 20)
    private SubscriptionPlanCode planCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 10)
    private BillingCycle billingCycle;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "current_period_start", nullable = false)
    private Instant currentPeriodStart;

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @Column(name = "notes")
    private String notes;

    protected TenantSubscription() {}

    public static TenantSubscription create(UUID tenantId, SubscriptionPlanCode planCode,
                                            BillingCycle billingCycle, UUID assignedBy,
                                            String notes) {
        TenantSubscription s = new TenantSubscription();
        s.tenantId            = tenantId;
        s.planCode            = planCode;
        s.billingCycle        = billingCycle;
        s.status              = SubscriptionStatus.ACTIVE;
        s.currentPeriodStart  = Instant.now();
        s.currentPeriodEnd    = computePeriodEnd(billingCycle);
        s.assignedBy          = assignedBy;
        s.assignedAt          = Instant.now();
        s.notes               = notes;
        return s;
    }

    public void reassign(SubscriptionPlanCode planCode, BillingCycle billingCycle,
                         UUID assignedBy, String notes) {
        this.planCode           = planCode;
        this.billingCycle       = billingCycle;
        this.status             = SubscriptionStatus.ACTIVE;
        this.currentPeriodStart = Instant.now();
        this.currentPeriodEnd   = computePeriodEnd(billingCycle);
        this.assignedBy         = assignedBy;
        this.assignedAt         = Instant.now();
        this.notes              = notes;
    }

    private static Instant computePeriodEnd(BillingCycle cycle) {
        return switch (cycle) {
            case MONTHLY -> Instant.now().plusSeconds(30L * 24 * 3600);
            case ANNUAL  -> Instant.now().plusSeconds(365L * 24 * 3600);
        };
    }

    // ── Accessors ─────────────────────────────────────────────────────────────
    public UUID                 getId()                 { return id; }
    public UUID                 getTenantId()           { return tenantId; }
    public SubscriptionPlanCode getPlanCode()           { return planCode; }
    public BillingCycle         getBillingCycle()       { return billingCycle; }
    public SubscriptionStatus   getStatus()             { return status; }
    public Instant              getCurrentPeriodStart() { return currentPeriodStart; }
    public Instant              getCurrentPeriodEnd()   { return currentPeriodEnd; }
    public UUID                 getAssignedBy()         { return assignedBy; }
    public Instant              getAssignedAt()         { return assignedAt; }
    public String               getNotes()              { return notes; }
}
