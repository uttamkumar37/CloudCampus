package com.cloudcampus.platform.subscription;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenant_school_limits")
public class TenantSchoolLimit {

    @Id
    @Column(name = "tenant_id", length = 36)
    private String tenantId;

    @Column(nullable = false)
    private int maxSchools;

    @Column(nullable = false)
    private Instant updatedAt;

    protected TenantSchoolLimit() {
    }

    public TenantSchoolLimit(String tenantId, int maxSchools) {
        this.tenantId = tenantId;
        this.maxSchools = maxSchools;
    }

    @PrePersist
    void prePersist() {
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void updateMaxSchools(int maxSchools) {
        this.maxSchools = maxSchools;
    }

    public String getTenantId() {
        return tenantId;
    }

    public int getMaxSchools() {
        return maxSchools;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
