package com.cloudcampus.attendance.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * An attendance session — one "taking" of attendance for a class / section
 * on a specific date and period.
 *
 * Rules:
 * - period_number = 0 means whole-day attendance.
 * - section_id is nullable; null means whole-class attendance (for schools
 *   that don't use section-level organisation).
 * - Once is_finalized = true the session is locked; no further marks accepted.
 * - taken_by_staff_id identifies who conducted the session (nullable).
 *
 * Maps to {@code attendance_sessions} (V20__create_attendance_sessions.sql).
 */
@Entity
@Table(name = "attendance_sessions")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class AttendanceSession {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "class_id", nullable = false, updatable = false)
    private UUID classId;

    /** Null = whole-class (no sections). */
    @Column(name = "section_id")
    private UUID sectionId;

    @Column(name = "academic_year_id", nullable = false, updatable = false)
    private UUID academicYearId;

    /** Optional — for subject-specific attendance. */
    @Column(name = "subject_id")
    private UUID subjectId;

    /** Staff member who conducted the session. */
    @Column(name = "taken_by_staff_id")
    private UUID takenByStaffId;

    @Column(name = "session_date", nullable = false, updatable = false)
    private LocalDate sessionDate;

    /**
     * 0 = whole-day, 1-12 = specific class period.
     */
    @Column(name = "period_number", nullable = false)
    private short periodNumber;

    @Column(name = "is_finalized", nullable = false)
    private boolean finalized;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AttendanceSession() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a new, open attendance session.
     *
     * @param tenantId       owning tenant
     * @param schoolId       school this session belongs to
     * @param classId        class
     * @param academicYearId academic year context
     * @param sessionDate    the calendar date
     * @param periodNumber   0 = whole-day, ≥1 = specific period
     */
    public static AttendanceSession create(UUID tenantId, UUID schoolId, UUID classId,
                                           UUID academicYearId, LocalDate sessionDate,
                                           int periodNumber) {
        AttendanceSession s = new AttendanceSession();
        s.tenantId       = tenantId;
        s.schoolId       = schoolId;
        s.classId        = classId;
        s.academicYearId = academicYearId;
        s.sessionDate    = sessionDate;
        s.periodNumber   = (short) periodNumber;
        s.finalized      = false;
        return s;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters / setters
    // ─────────────────────────────────────────────────────────────────────────

    public UUID    getId()             { return id; }
    public UUID    getTenantId()       { return tenantId; }
    public UUID    getSchoolId()       { return schoolId; }
    public UUID    getClassId()        { return classId; }
    public UUID    getSectionId()      { return sectionId; }
    public UUID    getAcademicYearId() { return academicYearId; }
    public UUID    getSubjectId()      { return subjectId; }
    public UUID    getTakenByStaffId() { return takenByStaffId; }
    public LocalDate getSessionDate()  { return sessionDate; }
    public int     getPeriodNumber()   { return periodNumber; }
    public boolean isFinalized()       { return finalized; }
    public Instant getCreatedAt()      { return createdAt; }
    public Instant getUpdatedAt()      { return updatedAt; }

    public void setSectionId(UUID sectionId)           { this.sectionId = sectionId; }
    public void setSubjectId(UUID subjectId)           { this.subjectId = subjectId; }
    public void setTakenByStaffId(UUID takenByStaffId) { this.takenByStaffId = takenByStaffId; }
    public void setFinalized(boolean finalized)        { this.finalized = finalized; }
}
