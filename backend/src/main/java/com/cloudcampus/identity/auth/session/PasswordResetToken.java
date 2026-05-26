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
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

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
    private PasswordResetTokenStatus status = PasswordResetTokenStatus.PENDING;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    protected PasswordResetToken() {
    }

    public PasswordResetToken(Tenant tenant, UserAccount user, String tokenHash, Instant expiresAt) {
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
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void markUsed(Instant usedAt) {
        this.status = PasswordResetTokenStatus.USED;
        this.usedAt = usedAt;
    }

    public void expire() {
        this.status = PasswordResetTokenStatus.EXPIRED;
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

    public PasswordResetTokenStatus getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}
