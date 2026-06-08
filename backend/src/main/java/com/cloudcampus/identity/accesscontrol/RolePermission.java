package com.cloudcampus.identity.accesscontrol;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;

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
        name = "role_permissions",
        uniqueConstraints = @UniqueConstraint(name = "uk_role_permissions_role_code", columnNames = {"role", "permission_code"})
)
public class RolePermission {

    @Id
    @Column(length = 180)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserRole role;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permission_code", referencedColumnName = "code", nullable = false)
    private Permission permission;

    @Column(nullable = false)
    private Instant createdAt;

    protected RolePermission() {
    }

    @PrePersist
    void prePersist() {
        if (id == null && role != null && permission != null) {
            id = role.name() + ":" + permission.getCode();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UserRole getRole() {
        return role;
    }

    public Permission getPermission() {
        return permission;
    }
}
