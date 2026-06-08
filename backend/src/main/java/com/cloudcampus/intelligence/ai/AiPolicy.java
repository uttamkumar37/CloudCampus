package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_policies")
public class AiPolicy {

    @Id
    @Column(length = 80)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String allowedFeaturesJson = "[]";

    @Column(nullable = false)
    private long monthlyBudgetUnits;

    @Column(nullable = false)
    private boolean humanApprovalRequiredDefault;

    @Column(nullable = false)
    private boolean allowLowRiskAutoPublish;

    @Column(nullable = false)
    private boolean allowFeeReminderAutoSend;

    @Column(nullable = false)
    private boolean allowParentMessageAutoSend;

    @Column(nullable = false)
    private int retentionDays;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

    protected AiPolicy() {
    }

    public AiPolicy(
            Tenant tenant,
            School school,
            boolean enabled,
            String allowedFeaturesJson,
            long monthlyBudgetUnits,
            boolean humanApprovalRequiredDefault,
            boolean allowLowRiskAutoPublish,
            boolean allowFeeReminderAutoSend,
            boolean allowParentMessageAutoSend,
            int retentionDays,
            UserAccount actor
    ) {
        this.tenant = tenant;
        this.school = school;
        update(
                enabled,
                allowedFeaturesJson,
                monthlyBudgetUnits,
                humanApprovalRequiredDefault,
                allowLowRiskAutoPublish,
                allowFeeReminderAutoSend,
                allowParentMessageAutoSend,
                retentionDays,
                actor
        );
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
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
            String allowedFeaturesJson,
            long monthlyBudgetUnits,
            boolean humanApprovalRequiredDefault,
            boolean allowLowRiskAutoPublish,
            boolean allowFeeReminderAutoSend,
            boolean allowParentMessageAutoSend,
            int retentionDays,
            UserAccount actor
    ) {
        this.enabled = enabled;
        this.allowedFeaturesJson = allowedFeaturesJson == null || allowedFeaturesJson.isBlank() ? "[]" : allowedFeaturesJson;
        this.monthlyBudgetUnits = monthlyBudgetUnits;
        this.humanApprovalRequiredDefault = humanApprovalRequiredDefault;
        this.allowLowRiskAutoPublish = allowLowRiskAutoPublish;
        this.allowFeeReminderAutoSend = allowFeeReminderAutoSend;
        this.allowParentMessageAutoSend = allowParentMessageAutoSend;
        this.retentionDays = retentionDays;
        this.updatedBy = actor;
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getAllowedFeaturesJson() {
        return allowedFeaturesJson;
    }

    public long getMonthlyBudgetUnits() {
        return monthlyBudgetUnits;
    }

    public boolean isHumanApprovalRequiredDefault() {
        return humanApprovalRequiredDefault;
    }

    public boolean isAllowLowRiskAutoPublish() {
        return allowLowRiskAutoPublish;
    }

    public boolean isAllowFeeReminderAutoSend() {
        return allowFeeReminderAutoSend;
    }

    public boolean isAllowParentMessageAutoSend() {
        return allowParentMessageAutoSend;
    }

    public int getRetentionDays() {
        return retentionDays;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
