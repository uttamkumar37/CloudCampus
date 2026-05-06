package com.cloudcampus.user.entity;

import com.cloudcampus.common.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "users")
public class UserAccount extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "email", nullable = true, unique = true, length = 160)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 200)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 40)
    private UserRole role;

    /**
     * Business / schema identifier for this account (redundant with schema-per-tenant but supports exports and future row-level models).
     */
    @Column(name = "tenant_id", length = 80)
    private String tenantId;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "first_login_required", nullable = false)
    private boolean firstLoginRequired = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

}
