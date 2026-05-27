package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Collectors;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "ai_tenant_entitlements")
public class AiTenantEntitlement implements Persistable<String> {

    @Id
    @Column(name = "tenant_id", length = 36)
    private String tenantId;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private long monthlyUnitBudget;

    @Column(nullable = false, length = 1000)
    private String enabledFeatures;

    @Column(nullable = false)
    private boolean humanApprovalRequired;

    @Column(nullable = false)
    private int retentionDays;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_user_id")
    private UserAccount updatedBy;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected AiTenantEntitlement() {
    }

    public AiTenantEntitlement(
            Tenant tenant,
            boolean enabled,
            long monthlyUnitBudget,
            Set<AiFeature> enabledFeatures,
            boolean humanApprovalRequired,
            int retentionDays,
            UserAccount updatedBy
    ) {
        this.tenant = tenant;
        this.tenantId = tenant.getId();
        update(enabled, monthlyUnitBudget, enabledFeatures, humanApprovalRequired, retentionDays, updatedBy);
    }

    @PrePersist
    void prePersist() {
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
            boolean enabled,
            long monthlyUnitBudget,
            Set<AiFeature> enabledFeatures,
            boolean humanApprovalRequired,
            int retentionDays,
            UserAccount updatedBy
    ) {
        this.enabled = enabled;
        this.monthlyUnitBudget = monthlyUnitBudget;
        this.enabledFeatures = serialize(enabledFeatures);
        this.humanApprovalRequired = humanApprovalRequired;
        this.retentionDays = retentionDays;
        this.updatedBy = updatedBy;
    }

    public String getTenantId() {
        return tenantId;
    }

    @Override
    public String getId() {
        return tenantId;
    }

    @Override
    @Transient
    public boolean isNew() {
        return createdAt == null;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public long getMonthlyUnitBudget() {
        return monthlyUnitBudget;
    }

    public Set<AiFeature> getEnabledFeatures() {
        if (enabledFeatures == null || enabledFeatures.isBlank()) {
            return EnumSet.noneOf(AiFeature.class);
        }
        return Arrays.stream(enabledFeatures.split(","))
                .filter(value -> !value.isBlank())
                .map(AiFeature::valueOf)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(AiFeature.class)));
    }

    public boolean isHumanApprovalRequired() {
        return humanApprovalRequired;
    }

    public int getRetentionDays() {
        return retentionDays;
    }

    public UserAccount getUpdatedBy() {
        return updatedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    private String serialize(Set<AiFeature> features) {
        if (features == null || features.isEmpty()) {
            return "";
        }
        return features.stream()
                .map(AiFeature::name)
                .sorted()
                .collect(Collectors.joining(","));
    }
}
