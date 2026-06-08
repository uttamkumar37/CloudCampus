package com.cloudcampus.intelligence.ai;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
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
@Table(name = "ai_recommendations")
public class AiRecommendation {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(nullable = false, length = 80)
    private String targetType;

    @Column(length = 36)
    private String targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 80)
    private AiRecommendationType recommendationType;

    @Column(nullable = false, length = 220)
    private String title;

    @Column(nullable = false, length = 1000)
    private String summary;

    @Column(length = 2000)
    private String rationale;

    private BigDecimal confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiRecommendationRiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AiRecommendationStatus status = AiRecommendationStatus.PENDING_REVIEW;

    @Column(nullable = false, length = 40)
    private String createdByActorType;

    @Column(length = 36)
    private String createdByActorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private UserAccount assignedTo;

    @Column(nullable = false)
    private boolean approvalRequired = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private UserAccount approvedBy;

    private Instant approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by")
    private UserAccount rejectedBy;

    private Instant rejectedAt;

    @Column(length = 500)
    private String rejectionReason;

    @Column(length = 40)
    private String executedByActorType;

    @Column(length = 36)
    private String executedByActorId;

    private Instant executedAt;

    @Column(length = 500)
    private String failureReason;

    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_usage_audit_id")
    private AiRequestAudit sourceUsageAudit;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String metadataJson = "{}";

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected AiRecommendation() {
    }

    public AiRecommendation(
            Tenant tenant,
            School school,
            String targetType,
            String targetId,
            AiRecommendationType recommendationType,
            String title,
            String summary,
            String rationale,
            BigDecimal confidenceScore,
            AiRecommendationRiskLevel riskLevel,
            AiRecommendationStatus status,
            String createdByActorType,
            String createdByActorId,
            UserAccount assignedTo,
            boolean approvalRequired,
            Instant expiresAt,
            AiRequestAudit sourceUsageAudit,
            String metadataJson
    ) {
        this.tenant = tenant;
        this.school = school;
        this.targetType = targetType;
        this.targetId = targetId;
        this.recommendationType = recommendationType;
        this.title = title;
        this.summary = summary;
        this.rationale = rationale;
        this.confidenceScore = confidenceScore;
        this.riskLevel = riskLevel;
        this.status = status;
        this.createdByActorType = createdByActorType;
        this.createdByActorId = createdByActorId;
        this.assignedTo = assignedTo;
        this.approvalRequired = approvalRequired;
        this.expiresAt = expiresAt;
        this.sourceUsageAudit = sourceUsageAudit;
        this.metadataJson = metadataJson == null || metadataJson.isBlank() ? "{}" : metadataJson;
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

    public void approve(UserAccount actor, Instant now) {
        status = AiRecommendationStatus.APPROVED;
        approvedBy = actor;
        approvedAt = now;
        rejectedBy = null;
        rejectedAt = null;
        rejectionReason = null;
    }

    public void reject(UserAccount actor, String reason, Instant now) {
        status = AiRecommendationStatus.REJECTED;
        rejectedBy = actor;
        rejectedAt = now;
        rejectionReason = reason;
    }

    public void execute(String actorType, String actorId, Instant now) {
        status = AiRecommendationStatus.EXECUTED;
        executedByActorType = actorType;
        executedByActorId = actorId;
        executedAt = now;
    }

    public void fail(String reason) {
        status = AiRecommendationStatus.FAILED;
        failureReason = reason;
    }

    public void cancel() {
        status = AiRecommendationStatus.CANCELLED;
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

    public String getTargetType() {
        return targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public AiRecommendationType getRecommendationType() {
        return recommendationType;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getRationale() {
        return rationale;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public AiRecommendationRiskLevel getRiskLevel() {
        return riskLevel;
    }

    public AiRecommendationStatus getStatus() {
        return status;
    }

    public String getCreatedByActorType() {
        return createdByActorType;
    }

    public String getCreatedByActorId() {
        return createdByActorId;
    }

    public UserAccount getAssignedTo() {
        return assignedTo;
    }

    public boolean isApprovalRequired() {
        return approvalRequired;
    }

    public UserAccount getApprovedBy() {
        return approvedBy;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public UserAccount getRejectedBy() {
        return rejectedBy;
    }

    public Instant getRejectedAt() {
        return rejectedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public AiRequestAudit getSourceUsageAudit() {
        return sourceUsageAudit;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
