package com.cloudcampus.school.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.util.UUID;

/**
 * A Department groups staff / teachers under a shared academic or
 * administrative umbrella (e.g. "Science", "Arts & Humanities", "PE").
 *
 * Rules:
 * - Department name is unique within a school.
 * - Short {@code code} is optional but, when provided, must also be unique
 *   per school (enforced by a partial unique index in V15).
 * - Soft-disable via {@code isActive} — historical timetable and payroll
 *   records reference this ID.
 *
 * Maps to {@code departments} table (V15__create_departments.sql).
 */
@Entity
@Table(
        name = "departments",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_departments_school_name",
                columnNames = {"school_id", "name"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class Department {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    // Full department name, e.g. "Science", "Arts & Humanities".
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    // Optional short code used in reports/timetables, e.g. "SCI", "HUM".
    @Column(name = "code", length = 20)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Department() {}

    @PrePersist
    void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
        isActive = true;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID    getId()          { return id; }
    public UUID    getTenantId()    { return tenantId; }
    public UUID    getSchoolId()    { return schoolId; }
    public String  getName()        { return name; }
    public String  getCode()        { return code; }
    public String  getDescription() { return description; }
    public boolean isActive()       { return isActive; }
    public Instant getCreatedAt()   { return createdAt; }
    public Instant getUpdatedAt()   { return updatedAt; }

    // ── Mutators ──────────────────────────────────────────────────────────────

    public void setName(String name)               { this.name        = name; }
    public void setCode(String code)               { this.code        = code; }
    public void setDescription(String description) { this.description = description; }
    public void setActive(boolean active)          { this.isActive    = active; }

    // ── Factory ───────────────────────────────────────────────────────────────

    public static Department create(UUID tenantId, UUID schoolId,
                                     String name, String code, String description) {
        Department d = new Department();
        d.tenantId    = tenantId;
        d.schoolId    = schoolId;
        d.name        = name;
        d.code        = code;
        d.description = description;
        return d;
    }
}
