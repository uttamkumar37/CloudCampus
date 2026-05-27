package com.cloudcampus.platform.subscription;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import com.cloudcampus.platform.tenant.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenant_invoices")
public class TenantInvoice {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan plan;

    @Column(nullable = false, unique = true, length = 60)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private BillingCycle billingCycle;

    @Column(nullable = false)
    private long amountCents;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TenantInvoiceStatus status = TenantInvoiceStatus.ISSUED;

    @Column(nullable = false)
    private Instant issuedAt;

    @Column
    private Instant dueAt;

    protected TenantInvoice() {
    }

    public TenantInvoice(
            Tenant tenant,
            SubscriptionPlan plan,
            String invoiceNumber,
            BillingCycle billingCycle,
            long amountCents,
            String currency,
            Instant dueAt
    ) {
        this.tenant = tenant;
        this.plan = plan;
        this.invoiceNumber = invoiceNumber;
        this.billingCycle = billingCycle;
        this.amountCents = amountCents;
        this.currency = currency.trim().toUpperCase(Locale.ROOT);
        this.dueAt = dueAt;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (issuedAt == null) {
            issuedAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public BillingCycle getBillingCycle() {
        return billingCycle;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public TenantInvoiceStatus getStatus() {
        return status;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public Instant getDueAt() {
        return dueAt;
    }
}
