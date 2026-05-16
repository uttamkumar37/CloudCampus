package com.cloudcampus.school.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Grants a user explicit access to a school within their tenant (CC-0214).
 *
 * One row per (user, school) pair — enforced by unique index.
 * is_primary = true marks the school embedded in the JWT on login.
 * Only one primary per user is maintained by the service layer.
 */
@Entity
@Table(name = "user_school_access")
public class UserSchoolAccess {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Column(name = "granted_at", nullable = false, updatable = false)
    private Instant grantedAt;

    @Column(name = "granted_by_user_id")
    private UUID grantedByUserId;

    protected UserSchoolAccess() {}

    public static UserSchoolAccess create(UUID userId, UUID schoolId, UUID tenantId,
                                          UUID grantedByUserId, boolean isPrimary) {
        UserSchoolAccess a = new UserSchoolAccess();
        a.userId          = userId;
        a.schoolId        = schoolId;
        a.tenantId        = tenantId;
        a.primary         = isPrimary;
        a.grantedByUserId = grantedByUserId;
        return a;
    }

    @PrePersist
    void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (grantedAt == null) grantedAt = Instant.now();
    }

    public void setPrimary(boolean primary) { this.primary = primary; }

    public UUID    getId()              { return id; }
    public UUID    getUserId()          { return userId; }
    public UUID    getSchoolId()        { return schoolId; }
    public UUID    getTenantId()        { return tenantId; }
    public boolean isPrimary()          { return primary; }
    public Instant getGrantedAt()       { return grantedAt; }
    public UUID    getGrantedByUserId() { return grantedByUserId; }
}
