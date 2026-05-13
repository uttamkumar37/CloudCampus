package com.cloudcampus.assignment.entity;

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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * One student's submission for an assignment (CC-0703).
 *
 * Lifecycle: PENDING → SUBMITTED (or LATE) → GRADED.
 * UNIQUE (assignment_id, student_id) — enforced in DB.
 *
 * Maps to {@code assignment_submissions} (V33__create_assignments.sql).
 */
@Entity
@Table(name = "assignment_submissions")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class AssignmentSubmission {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "assignment_id", nullable = false, updatable = false)
    private UUID assignmentId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubmissionStatus status;

    @Column(name = "text_response", columnDefinition = "TEXT")
    private String textResponse;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "marks_obtained", precision = 8, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "graded_by")
    private UUID gradedBy;

    @Column(name = "graded_at")
    private Instant gradedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssignmentSubmission() {}

    public static AssignmentSubmission create(UUID tenantId, UUID schoolId,
                                              UUID assignmentId, UUID studentId) {
        AssignmentSubmission s = new AssignmentSubmission();
        s.tenantId     = tenantId;
        s.schoolId     = schoolId;
        s.assignmentId = assignmentId;
        s.studentId    = studentId;
        s.status       = SubmissionStatus.PENDING;
        return s;
    }

    public void submit(String textResponse, boolean isLate) {
        this.textResponse = textResponse;
        this.submittedAt  = Instant.now();
        this.status       = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;
    }

    public void grade(BigDecimal marks, String feedback, UUID gradedBy) {
        this.marksObtained = marks;
        this.feedback      = feedback;
        this.gradedBy      = gradedBy;
        this.gradedAt      = Instant.now();
        this.status        = SubmissionStatus.GRADED;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }

    public UUID             getId()           { return id; }
    public UUID             getTenantId()     { return tenantId; }
    public UUID             getAssignmentId() { return assignmentId; }
    public UUID             getStudentId()    { return studentId; }
    public UUID             getSchoolId()     { return schoolId; }
    public SubmissionStatus getStatus()       { return status; }
    public String           getTextResponse() { return textResponse; }
    public Instant          getSubmittedAt()  { return submittedAt; }
    public BigDecimal       getMarksObtained(){ return marksObtained; }
    public String           getFeedback()     { return feedback; }
    public UUID             getGradedBy()     { return gradedBy; }
    public Instant          getGradedAt()     { return gradedAt; }
    public Instant          getCreatedAt()    { return createdAt; }
    public Instant          getUpdatedAt()    { return updatedAt; }
}
