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
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_request_audits")
public class AiRequestAudit {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private AiFeature feature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AiScopeType scopeType;

    @Column(length = 80)
    private String scopeId;

    @Column(nullable = false, length = 80)
    private String requestType;

    @Column(nullable = false, length = 64)
    private String promptSha256;

    @Column(nullable = false)
    private int promptLength;

    @Column(nullable = false)
    private long estimatedInputUnits;

    @Column(nullable = false)
    private long estimatedOutputUnits;

    @Column(nullable = false)
    private long estimatedCostCents;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AiUsageStatus status;

    @Column(length = 240)
    private String denialReason;

    @Column(nullable = false)
    private Instant createdAt;

    protected AiRequestAudit() {
    }

    public AiRequestAudit(
            Tenant tenant,
            School school,
            UserAccount user,
            AiFeature feature,
            AiScopeType scopeType,
            String scopeId,
            String requestType,
            String promptSha256,
            int promptLength,
            long estimatedInputUnits,
            long estimatedOutputUnits,
            long estimatedCostCents,
            AiUsageStatus status,
            String denialReason
    ) {
        this.tenant = tenant;
        this.school = school;
        this.user = user;
        this.userRole = user.getRole();
        this.feature = feature;
        this.scopeType = scopeType;
        this.scopeId = blankToNull(scopeId);
        this.requestType = requestType.trim();
        this.promptSha256 = promptSha256;
        this.promptLength = promptLength;
        this.estimatedInputUnits = estimatedInputUnits;
        this.estimatedOutputUnits = estimatedOutputUnits;
        this.estimatedCostCents = estimatedCostCents;
        this.status = status;
        this.denialReason = blankToNull(denialReason);
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
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

    public UserAccount getUser() {
        return user;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public AiFeature getFeature() {
        return feature;
    }

    public AiScopeType getScopeType() {
        return scopeType;
    }

    public String getScopeId() {
        return scopeId;
    }

    public String getRequestType() {
        return requestType;
    }

    public String getPromptSha256() {
        return promptSha256;
    }

    public int getPromptLength() {
        return promptLength;
    }

    public long getEstimatedInputUnits() {
        return estimatedInputUnits;
    }

    public long getEstimatedOutputUnits() {
        return estimatedOutputUnits;
    }

    public long getEstimatedCostCents() {
        return estimatedCostCents;
    }

    public AiUsageStatus getStatus() {
        return status;
    }

    public String getDenialReason() {
        return denialReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
