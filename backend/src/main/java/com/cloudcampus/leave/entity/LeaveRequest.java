package com.cloudcampus.leave.entity;

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
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * A staff member's leave request.
 *
 * Lifecycle: PENDING → APPROVED | REJECTED (by admin)
 *            PENDING → CANCELLED (by requester before review)
 *
 * Maps to {@code leave_requests} (V38__create_leave_management.sql).
 */
@Entity
@Table(name = "leave_requests")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class LeaveRequest {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "staff_id", nullable = false, updatable = false)
    private UUID staffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(name = "start_date", nullable = false, updatable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false, updatable = false)
    private LocalDate endDate;

    @Column(name = "total_days", nullable = false, updatable = false)
    private int totalDays;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LeaveStatus status;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ── Factory ───────────────────────────────────────────────────────────────

    public static LeaveRequest create(
            UUID tenantId, UUID schoolId, UUID staffId,
            LeaveType type, LocalDate start, LocalDate end, String reason) {
        LeaveRequest lr = new LeaveRequest();
        lr.id         = UUID.randomUUID();
        lr.tenantId   = tenantId;
        lr.schoolId   = schoolId;
        lr.staffId    = staffId;
        lr.leaveType  = type;
        lr.startDate  = start;
        lr.endDate    = end;
        lr.totalDays  = (int) ChronoUnit.DAYS.between(start, end) + 1;
        lr.reason     = reason;
        lr.status     = LeaveStatus.PENDING;
        return lr;
    }

    public void approve(UUID reviewerId, String notes) {
        this.status     = LeaveStatus.APPROVED;
        this.reviewedBy = reviewerId;
        this.reviewNotes = notes;
        this.reviewedAt = Instant.now();
    }

    public void reject(UUID reviewerId, String notes) {
        this.status     = LeaveStatus.REJECTED;
        this.reviewedBy = reviewerId;
        this.reviewNotes = notes;
        this.reviewedAt = Instant.now();
    }

    public void cancel() {
        this.status = LeaveStatus.CANCELLED;
    }

    @PrePersist  void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate   void onUpdate() { updatedAt = Instant.now(); }

    // ── Getters ───────────────────────────────────────────────────────────────

    public UUID        getId()          { return id; }
    public UUID        getTenantId()    { return tenantId; }
    public UUID        getSchoolId()    { return schoolId; }
    public UUID        getStaffId()     { return staffId; }
    public LeaveType   getLeaveType()   { return leaveType; }
    public LocalDate   getStartDate()   { return startDate; }
    public LocalDate   getEndDate()     { return endDate; }
    public int         getTotalDays()   { return totalDays; }
    public String      getReason()      { return reason; }
    public LeaveStatus getStatus()      { return status; }
    public UUID        getReviewedBy()  { return reviewedBy; }
    public String      getReviewNotes() { return reviewNotes; }
    public Instant     getReviewedAt()  { return reviewedAt; }
    public Instant     getCreatedAt()   { return createdAt; }
    public Instant     getUpdatedAt()   { return updatedAt; }
}
