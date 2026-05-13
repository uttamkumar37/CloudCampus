package com.cloudcampus.finance.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

/**
 * A named fee head for a school, e.g. "Tuition Fee", "Library Fee", "Sports Fee".
 * Used as the basis for {@link FeeStructure} line items.
 *
 * Maps to {@code fee_categories} (V22__create_fee_categories.sql).
 */
@Entity
@Table(
        name = "fee_categories",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_fee_category_school_name",
                columnNames = {"school_id", "name"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class FeeCategory {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected FeeCategory() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static FeeCategory create(UUID tenantId, UUID schoolId, String name, String description) {
        FeeCategory c = new FeeCategory();
        c.tenantId    = tenantId;
        c.schoolId    = schoolId;
        c.name        = name;
        c.description = description;
        c.active      = true;
        return c;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        id        = UUID.randomUUID();
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = Instant.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Behaviour
    // ─────────────────────────────────────────────────────────────────────────

    public void deactivate() { this.active = false; }

    public void updateDetails(String name, String description) {
        this.name        = name;
        this.description = description;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public UUID    getId()          { return id; }
    public UUID    getTenantId()    { return tenantId; }
    public UUID    getSchoolId()    { return schoolId; }
    public String  getName()        { return name; }
    public String  getDescription() { return description; }
    public boolean isActive()       { return active; }
    public Instant getCreatedAt()   { return createdAt; }
    public Instant getUpdatedAt()   { return updatedAt; }
}
