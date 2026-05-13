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
 * A Subject is an academic subject taught at a school.
 *
 * Design:
 * - School-scoped (NOT academic-year-scoped) — "Mathematics" is the same
 *   subject across all years. The timetable (Phase E+) links subjects to
 *   specific classes per year.
 * - {@code code} is a short identifier used in reports and imports
 *   (e.g. "MATH", "ENG", "PHY"). Unique per school.
 * - Soft-disable via {@code isActive} instead of deleting — historical
 *   timetable and result records reference this ID.
 *
 * Maps to {@code subjects} table (V14__create_subjects.sql).
 */
@Entity
@Table(
        name = "subjects",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_subjects_school_code",
                columnNames = {"school_id", "code"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class Subject {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    // Full name, e.g. "Mathematics", "English Language", "Physical Education".
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    // Short code for reports and CSV imports, e.g. "MATH", "ENG", "PE".
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    // FALSE = subject is no longer taught; hidden from dropdowns but data retained.
    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Subject() {}

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

    public void setName(String name)              { this.name        = name; }
    public void setCode(String code)              { this.code        = code; }
    public void setDescription(String description){ this.description = description; }
    public void setActive(boolean active)         { this.isActive    = active; }

    // ── Factory ───────────────────────────────────────────────────────────────

    public static Subject create(UUID tenantId, UUID schoolId,
                                  String name, String code, String description) {
        Subject s = new Subject();
        s.tenantId    = tenantId;
        s.schoolId    = schoolId;
        s.name        = name;
        s.code        = code;
        s.description = description;
        return s;
    }
}
