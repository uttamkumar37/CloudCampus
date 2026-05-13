package com.cloudcampus.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.util.UUID;

/**
 * Platform user — all roles, all tenants.
 *
 * tenant_id is NULL for SUPER_ADMIN (platform-level account, no tenant context).
 * All other roles must have a non-null tenant_id.
 *
 * SECURITY: Never include passwordHash in any API response DTO.
 *           password_hash stores a BCrypt-encoded value (prefix $2a$12$...).
 */
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@FilterDef(
        name = TenantFilter.NAME,
        parameters = @ParamDef(name = TenantFilter.PARAM, type = UUID.class)
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class User {

    @Id
    private UUID id;

    // NULL for SUPER_ADMIN. Non-null for all tenant-scoped roles.
    @Column(name = "tenant_id")
    private UUID tenantId;

    // Used as login identifier. Globally unique. Typically email address.
    @Column(name = "username", nullable = false, unique = true, length = 200, updatable = false)
    private String username;

    // BCrypt hash. Never expose outside auth layer.
    @Column(name = "password_hash", nullable = false, length = 200)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private UserStatus status;

    // When true: user must change password on next login (bootstrap/bulk-created accounts).
    @Column(name = "force_password_change", nullable = false)
    private boolean forcePasswordChange;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // NULL = active. Non-null = soft-deleted. Set by @SQLDelete — never set directly.
    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected User() {
    }

    public User(UUID id, UUID tenantId, String username, String passwordHash,
                UserRole role, UserStatus status, boolean forcePasswordChange,
                Instant createdAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
        this.forcePasswordChange = forcePasswordChange;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    @PrePersist
    void onPersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId()                  { return id; }
    public UUID getTenantId()            { return tenantId; }
    public String getUsername()          { return username; }
    public String getPasswordHash()      { return passwordHash; }
    public UserRole getRole()            { return role; }
    public UserStatus getStatus()        { return status; }
    public boolean isForcePasswordChange() { return forcePasswordChange; }
    public Instant getCreatedAt()        { return createdAt; }
    public Instant getUpdatedAt()        { return updatedAt; }

    public Instant getDeletedAt()   { return deletedAt; }
    public boolean isDeleted()       { return deletedAt != null; }

    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setStatus(UserStatus status)         { this.status = status; }
    public void setForcePasswordChange(boolean flag) { this.forcePasswordChange = flag; }

    /**
     * Soft-deletes this user by setting the deletion timestamp.
     * Prefer calling {@code userRepository.delete(user)} which triggers
     * the {@code @SQLDelete} UPDATE. Only call this directly when you need
     * to set the timestamp manually (e.g. bulk operations).
     */
    public void softDelete() {
        this.deletedAt = Instant.now();
    }
}
