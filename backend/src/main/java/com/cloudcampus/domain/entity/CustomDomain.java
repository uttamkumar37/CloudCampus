package com.cloudcampus.domain.entity;

import com.cloudcampus.domain.entity.DomainStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "custom_domains")
public class CustomDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String domain;

    @Column(name = "verification_token", nullable = false)
    private String verificationToken;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DomainStatus status = DomainStatus.PENDING;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public static CustomDomain create(UUID tenantId, String domain) {
        CustomDomain cd = new CustomDomain();
        cd.tenantId          = tenantId;
        cd.domain            = domain.toLowerCase().trim();
        cd.verificationToken = "cc-verify-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        cd.status            = DomainStatus.PENDING;
        return cd;
    }

    public void markVerified() {
        this.status      = DomainStatus.VERIFIED;
        this.verifiedAt  = Instant.now();
        this.failureReason = null;
        this.lastCheckedAt = Instant.now();
        this.updatedAt   = Instant.now();
    }

    public void markFailed(String reason) {
        this.status        = DomainStatus.FAILED;
        this.failureReason = reason;
        this.lastCheckedAt = Instant.now();
        this.updatedAt     = Instant.now();
    }

    public void recordCheck() {
        this.lastCheckedAt = Instant.now();
        this.updatedAt     = Instant.now();
    }

    // ── Getters ────────────────────────────────────────────────────────────────

    public UUID getId()                  { return id; }
    public UUID getTenantId()            { return tenantId; }
    public String getDomain()            { return domain; }
    public String getVerificationToken() { return verificationToken; }
    public DomainStatus getStatus()      { return status; }
    public Instant getVerifiedAt()       { return verifiedAt; }
    public Instant getLastCheckedAt()    { return lastCheckedAt; }
    public String getFailureReason()     { return failureReason; }
    public Instant getCreatedAt()        { return createdAt; }
    public Instant getUpdatedAt()        { return updatedAt; }
}
