package com.cloudcampus.identity.auth;

import java.time.Instant;
import java.util.UUID;

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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "user_accounts",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_accounts_tenant_email", columnNames = {"tenant_id", "email"})
)
public class UserAccount {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(nullable = false, length = 160)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private UserStatus status = UserStatus.INVITED;

    @Column(length = 120)
    private String passwordHash;

    @Column(nullable = false)
    private boolean mustChangePassword;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant activatedAt;

    protected UserAccount() {
    }

    public UserAccount(Tenant tenant, String email, String displayName, UserRole role) {
        this.tenant = tenant;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
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

    public void activate(String passwordHash, String displayName, Instant activatedAt) {
        this.passwordHash = passwordHash;
        if (displayName != null && !displayName.isBlank()) {
            this.displayName = displayName.trim();
        }
        this.status = UserStatus.ACTIVE;
        this.mustChangePassword = false;
        this.activatedAt = activatedAt;
    }

    public void changePassword(String passwordHash) {
        this.passwordHash = passwordHash;
        this.mustChangePassword = false;
    }

    public void requirePasswordChange() {
        this.mustChangePassword = true;
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public Instant getActivatedAt() {
        return activatedAt;
    }
}
