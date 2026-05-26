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
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private RefreshTokenStatus status = RefreshTokenStatus.ACTIVE;

    @Column(nullable = false)
    private Instant issuedAt;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant revokedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaced_by_token_id")
    private RefreshToken replacedByToken;

    protected RefreshToken() {
    }

    public RefreshToken(Tenant tenant, UserAccount user, String tokenHash, Instant expiresAt) {
        this.tenant = tenant;
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
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

    public void rotateTo(RefreshToken replacement, Instant rotatedAt) {
        this.status = RefreshTokenStatus.ROTATED;
        this.revokedAt = rotatedAt;
        this.replacedByToken = replacement;
    }

    public void revoke(Instant revokedAt) {
        this.status = RefreshTokenStatus.REVOKED;
        this.revokedAt = revokedAt;
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

    public RefreshTokenStatus getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}
