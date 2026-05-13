package com.cloudcampus.school.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Filter;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * An AcademicYear defines the calendar period for a school (e.g. "2025-26").
 *
 * Rules:
 * - Only one year per school may be marked {@code isCurrent = true} at a time
 *   (enforced by a partial unique index in V11).
 * - Classes, Students, and Attendance all reference an academic year so that
 *   historical data remains intact when a new year begins.
 *
 * Maps to {@code academic_years} table (V11__create_academic_years.sql).
 */
@Entity
@Table(name = "academic_years")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class AcademicYear {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    // Human-readable label, e.g. "2025-26".
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // At most one current year per school — enforced by DB partial unique index.
    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AcademicYearStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AcademicYear() {}

    @PrePersist
    void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (status    == null) status    = AcademicYearStatus.ACTIVE;
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID               getId()        { return id; }
    public UUID               getTenantId()  { return tenantId; }
    public UUID               getSchoolId()  { return schoolId; }
    public String             getName()      { return name; }
    public LocalDate          getStartDate() { return startDate; }
    public LocalDate          getEndDate()   { return endDate; }
    public boolean            isCurrent()    { return isCurrent; }
    public AcademicYearStatus getStatus()    { return status; }
    public Instant            getCreatedAt() { return createdAt; }
    public Instant            getUpdatedAt() { return updatedAt; }

    // ── Mutators ──────────────────────────────────────────────────────────────

    public void setName(String name)                  { this.name      = name; }
    public void setStartDate(LocalDate d)             { this.startDate = d; }
    public void setEndDate(LocalDate d)               { this.endDate   = d; }
    public void setCurrent(boolean current)           { this.isCurrent = current; }
    public void setStatus(AcademicYearStatus status)  { this.status    = status; }

    // ── Builder-style factory ─────────────────────────────────────────────────

    public static AcademicYear create(UUID tenantId, UUID schoolId, String name,
                                      LocalDate startDate, LocalDate endDate,
                                      boolean isCurrent) {
        AcademicYear y = new AcademicYear();
        y.tenantId  = tenantId;
        y.schoolId  = schoolId;
        y.name      = name;
        y.startDate = startDate;
        y.endDate   = endDate;
        y.isCurrent = isCurrent;
        y.status    = AcademicYearStatus.ACTIVE;
        return y;
    }
}
