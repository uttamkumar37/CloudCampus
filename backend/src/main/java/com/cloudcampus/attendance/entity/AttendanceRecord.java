package com.cloudcampus.attendance.entity;

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
import java.util.UUID;

/**
 * One student's attendance status within an {@link AttendanceSession}.
 *
 * Rules:
 * - (session_id, student_id) is unique — enforced by DB + service upsert.
 * - tenant_id is denormalized for efficient tenant-filtered queries.
 * - Records can be updated (corrected) while the session is not yet finalized.
 *
 * Maps to {@code attendance_records} (V21__create_attendance_records.sql).
 */
@Entity
@Table(
        name = "attendance_records",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_att_record_session_student",
                columnNames = {"session_id", "student_id"}
        )
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class AttendanceRecord {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "session_id", nullable = false, updatable = false)
    private UUID sessionId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(name = "remarks", length = 300)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AttendanceRecord() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static AttendanceRecord create(UUID tenantId, UUID sessionId,
                                          UUID studentId, AttendanceStatus status) {
        AttendanceRecord r = new AttendanceRecord();
        r.tenantId  = tenantId;
        r.sessionId = sessionId;
        r.studentId = studentId;
        r.status    = status;
        return r;
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

    public UUID             getId()        { return id; }
    public UUID             getTenantId()  { return tenantId; }
    public UUID             getSessionId() { return sessionId; }
    public UUID             getStudentId() { return studentId; }
    public AttendanceStatus getStatus()    { return status; }
    public String           getRemarks()   { return remarks; }
    public Instant          getCreatedAt() { return createdAt; }
    public Instant          getUpdatedAt() { return updatedAt; }

    public void setStatus(AttendanceStatus status)  { this.status = status; }
    public void setRemarks(String remarks)           { this.remarks = remarks; }
}
