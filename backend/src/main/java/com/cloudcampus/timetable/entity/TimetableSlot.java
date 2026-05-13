package com.cloudcampus.timetable.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

/**
 * One period slot in a weekly class timetable (CC-0701).
 *
 * Rules:
 * - UNIQUE (school_id, academic_year_id, class_id, section_id, day_of_week, period_number)
 *   — enforced in DB; service layer also guards teacher double-booking.
 * - staff_id is nullable (free period / no teacher assigned yet).
 *
 * Maps to {@code timetable_slots} (V31__create_timetable.sql).
 */
@Entity
@Table(name = "timetable_slots")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class TimetableSlot {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "academic_year_id", nullable = false, updatable = false)
    private UUID academicYearId;

    @Column(name = "class_id", nullable = false, updatable = false)
    private UUID classId;

    @Column(name = "section_id", nullable = false, updatable = false)
    private UUID sectionId;

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @Column(name = "period_number", nullable = false)
    private short periodNumber;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TimetableSlot() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static TimetableSlot create(
            UUID tenantId, UUID schoolId, UUID academicYearId,
            UUID classId, UUID sectionId, UUID subjectId,
            UUID staffId, DayOfWeek dayOfWeek, short periodNumber,
            LocalTime startTime, LocalTime endTime) {
        TimetableSlot s = new TimetableSlot();
        s.tenantId       = tenantId;
        s.schoolId       = schoolId;
        s.academicYearId = academicYearId;
        s.classId        = classId;
        s.sectionId      = sectionId;
        s.subjectId      = subjectId;
        s.staffId        = staffId;
        s.dayOfWeek      = dayOfWeek;
        s.periodNumber   = periodNumber;
        s.startTime      = startTime;
        s.endTime        = endTime;
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
    // Getters
    // ─────────────────────────────────────────────────────────────────────────

    public UUID        getId()             { return id; }
    public UUID        getTenantId()       { return tenantId; }
    public UUID        getSchoolId()       { return schoolId; }
    public UUID        getAcademicYearId() { return academicYearId; }
    public UUID        getClassId()        { return classId; }
    public UUID        getSectionId()      { return sectionId; }
    public UUID        getSubjectId()      { return subjectId; }
    public UUID        getStaffId()        { return staffId; }
    public DayOfWeek   getDayOfWeek()      { return dayOfWeek; }
    public short       getPeriodNumber()   { return periodNumber; }
    public LocalTime   getStartTime()      { return startTime; }
    public LocalTime   getEndTime()        { return endTime; }
    public Instant     getCreatedAt()      { return createdAt; }
    public Instant     getUpdatedAt()      { return updatedAt; }

    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }
    public void setStaffId(UUID staffId)     { this.staffId = staffId; }
    public void setStartTime(LocalTime t)    { this.startTime = t; }
    public void setEndTime(LocalTime t)      { this.endTime = t; }
}
