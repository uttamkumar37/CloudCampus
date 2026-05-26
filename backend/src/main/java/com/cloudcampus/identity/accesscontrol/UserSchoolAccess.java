package com.cloudcampus.identity.accesscontrol;

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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "user_school_access",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_school_access_user_school", columnNames = {"user_id", "school_id"})
)
public class UserSchoolAccess {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole role;

    @Column(nullable = false)
    private boolean primaryAccess;

    @Column(nullable = false)
    private Instant grantedAt;

    protected UserSchoolAccess() {
    }

    public UserSchoolAccess(Tenant tenant, School school, UserAccount user, UserRole role, boolean primaryAccess) {
        this.tenant = tenant;
        this.school = school;
        this.user = user;
        this.role = role;
        this.primaryAccess = primaryAccess;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (grantedAt == null) {
            grantedAt = Instant.now();
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

    public UserRole getRole() {
        return role;
    }

    public boolean isPrimaryAccess() {
        return primaryAccess;
    }
}
