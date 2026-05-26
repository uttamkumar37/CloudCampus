package com.cloudcampus.identity.auth.invitation;

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

@Entity
@Table(name = "invitations")
public class Invitation {

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

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant acceptedAt;

    @Column(nullable = false)
    private Instant createdAt;

    protected Invitation() {
    }

    public Invitation(Tenant tenant, School school, UserAccount user, UserRole role, String tokenHash, Instant expiresAt) {
        this.tenant = tenant;
        this.school = school;
        this.user = user;
        this.role = role;
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

    public void accept(Instant acceptedAt) {
        this.status = InvitationStatus.ACCEPTED;
        this.acceptedAt = acceptedAt;
    }

    public void expire() {
        this.status = InvitationStatus.EXPIRED;
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

    public InvitationStatus getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }
}
