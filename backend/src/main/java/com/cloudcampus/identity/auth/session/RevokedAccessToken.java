package com.cloudcampus.identity.auth.session;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "revoked_access_tokens")
public class RevokedAccessToken {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant revokedAt;

    protected RevokedAccessToken() {
    }

    public RevokedAccessToken(String tokenHash, UserAccount user, Instant expiresAt, Instant revokedAt) {
        this.tokenHash = tokenHash;
        this.user = user;
        this.expiresAt = expiresAt;
        this.revokedAt = revokedAt;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
