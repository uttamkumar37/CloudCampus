package com.cloudcampus.school;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.platform.tenant.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "schools",
        uniqueConstraints = @UniqueConstraint(name = "uk_schools_tenant_code", columnNames = {"tenant_id", "code"})
)
public class School {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 40)
    private String code;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false)
    private boolean primarySchool;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    protected School() {
    }

    public School(Tenant tenant, String code, String name, boolean primarySchool) {
        this.tenant = tenant;
        this.code = code;
        this.name = name;
        this.primarySchool = primarySchool;
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

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public boolean isPrimarySchool() {
        return primarySchool;
    }

    public boolean isActive() {
        return active;
    }
}
