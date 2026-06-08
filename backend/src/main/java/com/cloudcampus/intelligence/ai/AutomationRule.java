package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "automation_rules")
public class AutomationRule {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(nullable = false, length = 120)
    private String code;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 80)
    private String triggerType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String triggerConfigJson = "{}";

    @Column(nullable = false, length = 80)
    private String actionType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String actionConfigJson = "{}";

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private boolean requiresApproval;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private UserRole approvalRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiRecommendationRiskLevel riskLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected AutomationRule() {
    }

    public AutomationRule(
            Tenant tenant,
            School school,
            String code,
            String name,
            String description,
            String triggerType,
            String triggerConfigJson,
            String actionType,
            String actionConfigJson,
            boolean enabled,
            boolean requiresApproval,
            UserRole approvalRole,
            AiRecommendationRiskLevel riskLevel,
            UserAccount actor
    ) {
        this.tenant = tenant;
        this.school = school;
        this.code = code;
        this.name = name;
        this.description = description;
        this.triggerType = triggerType;
        this.triggerConfigJson = triggerConfigJson == null || triggerConfigJson.isBlank() ? "{}" : triggerConfigJson;
        this.actionType = actionType;
        this.actionConfigJson = actionConfigJson == null || actionConfigJson.isBlank() ? "{}" : actionConfigJson;
        this.enabled = enabled;
        this.requiresApproval = requiresApproval;
        this.approvalRole = approvalRole;
        this.riskLevel = riskLevel;
        this.createdBy = actor;
        this.updatedBy = actor;
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

    public void update(String name, String description, Boolean enabled, Boolean requiresApproval, UserRole approvalRole, AiRecommendationRiskLevel riskLevel, UserAccount actor) {
        if (name != null && !name.isBlank()) {
            this.name = name.trim();
        }
        if (description != null) {
            this.description = description.trim();
        }
        if (enabled != null) {
            this.enabled = enabled;
        }
        if (requiresApproval != null) {
            this.requiresApproval = requiresApproval;
        }
        if (approvalRole != null) {
            this.approvalRole = approvalRole;
        }
        if (riskLevel != null) {
            this.riskLevel = riskLevel;
        }
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

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getTriggerType() {
        return triggerType;
    }

    public String getActionType() {
        return actionType;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isRequiresApproval() {
        return requiresApproval;
    }

    public UserRole getApprovalRole() {
        return approvalRole;
    }

    public AiRecommendationRiskLevel getRiskLevel() {
        return riskLevel;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
