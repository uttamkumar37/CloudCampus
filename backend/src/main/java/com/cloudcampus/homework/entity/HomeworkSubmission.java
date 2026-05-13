package com.cloudcampus.homework.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

/**
 * A student's submission for a homework assignment (CC-0701).
 *
 * Unique constraint: (homework_id, student_id) — one submission per student per assignment.
 * Status lifecycle: SUBMITTED → REVIEWED (teacher marks it done).
 */
@Entity
@Table(name = "homework_submissions")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class HomeworkSubmission {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "homework_id", nullable = false, updatable = false)
    private UUID homeworkId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubmissionStatus status;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected HomeworkSubmission() {}

    public static HomeworkSubmission create(UUID tenantId, UUID homeworkId, UUID studentId, String notes) {
        HomeworkSubmission s = new HomeworkSubmission();
        s.tenantId   = tenantId;
        s.homeworkId = homeworkId;
        s.studentId  = studentId;
        s.notes      = notes;
        s.status     = SubmissionStatus.SUBMITTED;
        return s;
    }

    @PrePersist
    void prePersist() {
        if (id          == null) id          = UUID.randomUUID();
        if (submittedAt == null) submittedAt = Instant.now();
        if (createdAt   == null) createdAt   = Instant.now();
    }

    public void markReviewed() {
        this.status     = SubmissionStatus.REVIEWED;
        this.reviewedAt = Instant.now();
    }

    public UUID             getId()          { return id; }
    public UUID             getTenantId()    { return tenantId; }
    public UUID             getHomeworkId()  { return homeworkId; }
    public UUID             getStudentId()   { return studentId; }
    public String           getNotes()       { return notes; }
    public SubmissionStatus getStatus()      { return status; }
    public Instant          getSubmittedAt() { return submittedAt; }
    public Instant          getReviewedAt()  { return reviewedAt; }
    public Instant          getCreatedAt()   { return createdAt; }
}
