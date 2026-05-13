package com.cloudcampus.staffattendance.entity;

import com.cloudcampus.common.tenant.TenantFilter;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * One staff member's attendance for a given calendar date.
 *
 * (school_id, staff_id, attendance_date) is unique — an upsert is used
 * so the admin can correct entries on the same day.
 *
 * Maps to {@code staff_attendance} (V37__create_staff_attendance.sql).
 */
@Entity
@Table(
        name = "staff_attendance",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_staff_attendance_day",
                columnNames = {"school_id", "staff_id", "attendance_date"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class StaffAttendance {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "staff_id", nullable = false, updatable = false)
    private UUID staffId;

    @Column(name = "attendance_date", nullable = false, updatable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StaffAttendanceStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "marked_by")
    private UUID markedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ── Factory ───────────────────────────────────────────────────────────────

    public static StaffAttendance create(
            UUID tenantId, UUID schoolId, UUID staffId,
            LocalDate date, StaffAttendanceStatus status, String notes, UUID markedBy) {
        StaffAttendance sa = new StaffAttendance();
        sa.id             = UUID.randomUUID();
        sa.tenantId       = tenantId;
        sa.schoolId       = schoolId;
        sa.staffId        = staffId;
        sa.attendanceDate = date;
        sa.status         = status;
        sa.notes          = notes;
        sa.markedBy       = markedBy;
        return sa;
    }

    public void updateStatus(StaffAttendanceStatus status, String notes) {
        this.status = status;
        this.notes  = notes;
    }

    @PrePersist
    void onCreate() { createdAt = updatedAt = Instant.now(); }

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }

    // ── Getters ───────────────────────────────────────────────────────────────

    public UUID getId()                      { return id; }
    public UUID getTenantId()                { return tenantId; }
    public UUID getSchoolId()                { return schoolId; }
    public UUID getStaffId()                 { return staffId; }
    public LocalDate getAttendanceDate()     { return attendanceDate; }
    public StaffAttendanceStatus getStatus() { return status; }
    public String getNotes()                 { return notes; }
    public UUID getMarkedBy()                { return markedBy; }
    public Instant getCreatedAt()            { return createdAt; }
    public Instant getUpdatedAt()            { return updatedAt; }
}
