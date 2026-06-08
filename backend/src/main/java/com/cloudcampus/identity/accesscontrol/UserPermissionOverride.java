package com.cloudcampus.identity.accesscontrol;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_permission_overrides")
public class UserPermissionOverride {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permission_code", referencedColumnName = "code", nullable = false)
    private Permission permission;

    @Column(nullable = false)
    private boolean allowed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(nullable = false, length = 30)
    private String scopeType;

    @Column(length = 36)
    private String scopeId;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private boolean active = true;

    private Instant startsAt;

    private Instant expiresAt;

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

    protected UserPermissionOverride() {
    }

    public UserPermissionOverride(
            UserAccount user,
            Permission permission,
            boolean allowed,
            Tenant tenant,
            School school,
            String scopeType,
            String scopeId,
            String reason,
            Instant startsAt,
            Instant expiresAt,
            UserAccount actor
    ) {
        this.user = user;
        this.permission = permission;
        this.allowed = allowed;
        this.tenant = tenant;
        this.school = school;
        this.scopeType = scopeType;
        this.scopeId = scopeId;
        this.reason = reason;
        this.startsAt = startsAt;
        this.expiresAt = expiresAt;
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

    public void update(Boolean active, Instant expiresAt, String reason, UserAccount actor) {
        if (active != null) {
            this.active = active;
        }
        if (expiresAt != null) {
            this.expiresAt = expiresAt;
        }
        if (reason != null && !reason.isBlank()) {
            this.reason = reason.trim();
        }
        this.updatedBy = actor;
    }

    public void deactivate(String reason, UserAccount actor) {
        this.active = false;
        if (reason != null && !reason.isBlank()) {
            this.reason = reason.trim();
        }
        this.updatedBy = actor;
    }

    public boolean currentlyActive(Instant now) {
        return active
                && (startsAt == null || !startsAt.isAfter(now))
                && (expiresAt == null || expiresAt.isAfter(now));
    }

    public String getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public Permission getPermission() {
        return permission;
    }

    public boolean isAllowed() {
        return allowed;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public String getScopeType() {
        return scopeType;
    }

    public String getScopeId() {
        return scopeId;
    }

    public String getReason() {
        return reason;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
