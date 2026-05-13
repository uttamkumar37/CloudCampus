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
 * A Class (grade level) within a school for a given academic year.
 *
 * Named {@code ClassRoom} to avoid collision with {@link java.lang.Class}.
 *
 * Examples: "Grade 5", "Class 10", "LKG", "UKG".
 *
 * A class is scoped to one academic year so that "Grade 5 / 2025-26" and
 * "Grade 5 / 2026-27" are distinct records — historical data stays intact.
 *
 * Sections hang off a ClassRoom (e.g. Grade 5 → Section A, Section B).
 *
 * Maps to {@code classes} table (V12__create_classes.sql).
 */
@Entity
@Table(
        name = "classes",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_classes_school_year_name",
                columnNames = {"school_id", "academic_year_id", "name"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class ClassRoom {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "academic_year_id", nullable = false, updatable = false)
    private UUID academicYearId;

    // Canonical name, e.g. "Grade 5", "Class 10", "LKG".
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Optional UI-friendly override, e.g. "Nursery" instead of "Grade 0".
    @Column(name = "display_name", length = 100)
    private String displayName;

    // Used for sorting classes numerically in UI (LKG=0, UKG=1, Grade1=1, …).
    @Column(name = "grade_order", nullable = false)
    private short gradeOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ClassRoom() {}

    @PrePersist
    void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID    getId()             { return id; }
    public UUID    getTenantId()       { return tenantId; }
    public UUID    getSchoolId()       { return schoolId; }
    public UUID    getAcademicYearId() { return academicYearId; }
    public String  getName()           { return name; }
    public String  getDisplayName()    { return displayName; }
    public short   getGradeOrder()     { return gradeOrder; }
    public Instant getCreatedAt()      { return createdAt; }
    public Instant getUpdatedAt()      { return updatedAt; }

    // ── Mutators ──────────────────────────────────────────────────────────────

    public void setName(String name)              { this.name        = name; }
    public void setDisplayName(String displayName){ this.displayName = displayName; }
    public void setGradeOrder(short gradeOrder)   { this.gradeOrder  = gradeOrder; }

    // ── Factory ───────────────────────────────────────────────────────────────

    public static ClassRoom create(UUID tenantId, UUID schoolId, UUID academicYearId,
                                   String name, short gradeOrder) {
        ClassRoom c = new ClassRoom();
        c.tenantId       = tenantId;
        c.schoolId       = schoolId;
        c.academicYearId = academicYearId;
        c.name           = name;
        c.gradeOrder     = gradeOrder;
        return c;
    }
}
