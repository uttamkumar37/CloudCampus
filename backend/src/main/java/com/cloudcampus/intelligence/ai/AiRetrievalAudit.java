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
@Table(name = "ai_retrieval_audits")
public class AiRetrievalAudit {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private AiFeature feature;

    @Column(nullable = false, length = 64)
    private String querySha256;

    @Column(nullable = false)
    private int queryLength;

    @Column(nullable = false)
    private int resultCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AiUsageStatus status;

    @Column(length = 240)
    private String denialReason;

    @Column(nullable = false)
    private Instant createdAt;

    protected AiRetrievalAudit() {
    }

    public AiRetrievalAudit(
            Tenant tenant,
            School school,
            UserAccount user,
            AiFeature feature,
            String querySha256,
            int queryLength,
            int resultCount,
            AiUsageStatus status,
            String denialReason
    ) {
        this.tenant = tenant;
        this.school = school;
        this.user = user;
        this.userRole = user.getRole();
        this.feature = feature;
        this.querySha256 = querySha256;
        this.queryLength = queryLength;
        this.resultCount = resultCount;
        this.status = status;
        this.denialReason = denialReason;
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

    public String getQuerySha256() {
        return querySha256;
    }

    public int getQueryLength() {
        return queryLength;
    }

    public int getResultCount() {
        return resultCount;
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
}
