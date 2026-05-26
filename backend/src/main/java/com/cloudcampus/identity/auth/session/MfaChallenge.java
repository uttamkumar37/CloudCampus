package com.cloudcampus.identity.auth.session;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;

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
@Table(name = "mfa_challenges")
public class MfaChallenge {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false, length = 120)
    private String codeHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private MfaChallengeStatus status = MfaChallengeStatus.PENDING;

    @Column(nullable = false)
    private int attemptCount;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant verifiedAt;

    protected MfaChallenge() {
    }

    public MfaChallenge(Tenant tenant, UserAccount user, String codeHash, Instant expiresAt) {
        this.tenant = tenant;
        this.user = user;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
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

    public void recordFailedAttempt() {
        this.attemptCount += 1;
        if (this.attemptCount >= 5) {
            this.status = MfaChallengeStatus.LOCKED;
        }
    }

    public void expire() {
        this.status = MfaChallengeStatus.EXPIRED;
    }

    public void markVerified(Instant verifiedAt) {
        this.status = MfaChallengeStatus.VERIFIED;
        this.verifiedAt = verifiedAt;
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public UserAccount getUser() {
        return user;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public MfaChallengeStatus getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}
