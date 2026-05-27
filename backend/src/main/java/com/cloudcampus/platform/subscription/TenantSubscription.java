package com.cloudcampus.platform.subscription;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenant_subscriptions")
public class TenantSubscription {

    @Id
    @Column(name = "tenant_id", length = 36)
    private String tenantId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TenantSubscriptionStatus status = TenantSubscriptionStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private BillingCycle billingCycle;

    @Column(nullable = false)
    private Instant currentPeriodStart;

    @Column
    private Instant currentPeriodEnd;

    @Column(nullable = false)
    private Instant assignedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "assigned_by_user_id")
    private UserAccount assignedBy;

    @Column(nullable = false)
    private Instant updatedAt;

    protected TenantSubscription() {
    }

    public TenantSubscription(
            Tenant tenant,
            SubscriptionPlan plan,
            BillingCycle billingCycle,
            Instant currentPeriodStart,
            Instant currentPeriodEnd,
            UserAccount assignedBy
    ) {
        this.tenant = tenant;
        this.plan = plan;
        this.billingCycle = billingCycle;
        this.currentPeriodStart = currentPeriodStart;
        this.currentPeriodEnd = currentPeriodEnd;
        this.assignedBy = assignedBy;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (assignedAt == null) {
            assignedAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void assign(
            SubscriptionPlan plan,
            BillingCycle billingCycle,
            Instant currentPeriodStart,
            Instant currentPeriodEnd,
            UserAccount assignedBy
    ) {
        this.plan = plan;
        this.billingCycle = billingCycle;
        this.currentPeriodStart = currentPeriodStart;
        this.currentPeriodEnd = currentPeriodEnd;
        this.assignedBy = assignedBy;
        this.assignedAt = Instant.now();
        this.status = TenantSubscriptionStatus.ACTIVE;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public TenantSubscriptionStatus getStatus() {
        return status;
    }

    public BillingCycle getBillingCycle() {
        return billingCycle;
    }

    public Instant getCurrentPeriodStart() {
        return currentPeriodStart;
    }

    public Instant getCurrentPeriodEnd() {
        return currentPeriodEnd;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public UserAccount getAssignedBy() {
        return assignedBy;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
