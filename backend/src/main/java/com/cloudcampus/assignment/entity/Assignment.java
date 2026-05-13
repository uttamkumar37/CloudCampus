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
import java.time.LocalDate;
import java.util.UUID;

/**
 * A graded assignment given to a class/section (CC-0703).
 *
 * Distinct from HomeworkAssignment in that it:
 *   - tracks individual student submissions.
 *   - carries optional max_marks for grading.
 *   - has a companion AssignmentSubmission per student.
 *
 * Maps to {@code assignments} (V33__create_assignments.sql).
 */
@Entity
@Table(name = "assignments")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class Assignment {

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

    @Column(name = "section_id", updatable = false)
    private UUID sectionId;

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "max_marks", precision = 8, scale = 2)
    private BigDecimal maxMarks;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AssignmentStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Assignment() {}

    public static Assignment create(
            UUID tenantId, UUID schoolId, UUID academicYearId,
            UUID classId, UUID sectionId, UUID subjectId,
            UUID assignedBy, String title, String description,
            LocalDate dueDate, BigDecimal maxMarks) {
        Assignment a = new Assignment();
        a.tenantId       = tenantId;
        a.schoolId       = schoolId;
        a.academicYearId = academicYearId;
        a.classId        = classId;
        a.sectionId      = sectionId;
        a.subjectId      = subjectId;
        a.assignedBy     = assignedBy;
        a.title          = title;
        a.description    = description;
        a.dueDate        = dueDate;
        a.maxMarks       = maxMarks;
        a.status         = AssignmentStatus.DRAFT;
        return a;
    }

    public void publish() { this.status = AssignmentStatus.PUBLISHED; }
    public void close()   { this.status = AssignmentStatus.CLOSED; }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }

    public UUID             getId()             { return id; }
    public UUID             getTenantId()       { return tenantId; }
    public UUID             getSchoolId()       { return schoolId; }
    public UUID             getAcademicYearId() { return academicYearId; }
    public UUID             getClassId()        { return classId; }
    public UUID             getSectionId()      { return sectionId; }
    public UUID             getSubjectId()      { return subjectId; }
    public UUID             getAssignedBy()     { return assignedBy; }
    public String           getTitle()          { return title; }
    public String           getDescription()    { return description; }
    public LocalDate        getDueDate()        { return dueDate; }
    public BigDecimal       getMaxMarks()       { return maxMarks; }
    public AssignmentStatus getStatus()         { return status; }
    public Instant          getCreatedAt()      { return createdAt; }
    public Instant          getUpdatedAt()      { return updatedAt; }

    public void setTitle(String t)         { this.title = t; }
    public void setDescription(String d)   { this.description = d; }
    public void setDueDate(LocalDate d)    { this.dueDate = d; }
    public void setMaxMarks(BigDecimal m)  { this.maxMarks = m; }
}
