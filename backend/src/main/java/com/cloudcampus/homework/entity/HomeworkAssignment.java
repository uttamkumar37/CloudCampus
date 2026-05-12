package com.cloudcampus.homework.entity;

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
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A homework assignment given to a class/section for a subject (CC-0702).
 *
 * Rules:
 * - section_id is nullable — null means the assignment targets the entire class.
 * - status lifecycle: DRAFT → PUBLISHED → CLOSED.
 * - attachment_urls stores a JSON array of file URLs (plain text, no ORM mapping).
 *
 * Maps to {@code homework_assignments} (V32__create_homework.sql).
 */
@Entity
@Table(name = "homework_assignments")
@FilterDef(
        name = TenantFilter.NAME,
        parameters = @ParamDef(name = TenantFilter.PARAM, type = UUID.class)
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class HomeworkAssignment {

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private HomeworkStatus status;

    /** JSON array of attachment URLs, stored as plain text. */
    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected HomeworkAssignment() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static HomeworkAssignment create(
            UUID tenantId, UUID schoolId, UUID academicYearId,
            UUID classId, UUID sectionId, UUID subjectId,
            UUID assignedBy, String title, String description,
            LocalDate dueDate) {
        HomeworkAssignment h = new HomeworkAssignment();
        h.tenantId       = tenantId;
        h.schoolId       = schoolId;
        h.academicYearId = academicYearId;
        h.classId        = classId;
        h.sectionId      = sectionId;
        h.subjectId      = subjectId;
        h.assignedBy     = assignedBy;
        h.title          = title;
        h.description    = description;
        h.dueDate        = dueDate;
        h.status         = HomeworkStatus.DRAFT;
        return h;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Behaviour
    // ─────────────────────────────────────────────────────────────────────────

    public void publish() { this.status = HomeworkStatus.PUBLISHED; }
    public void close()   { this.status = HomeworkStatus.CLOSED; }

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
    void preUpdate() { updatedAt = Instant.now(); }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters / Setters
    // ─────────────────────────────────────────────────────────────────────────

    public UUID           getId()             { return id; }
    public UUID           getTenantId()       { return tenantId; }
    public UUID           getSchoolId()       { return schoolId; }
    public UUID           getAcademicYearId() { return academicYearId; }
    public UUID           getClassId()        { return classId; }
    public UUID           getSectionId()      { return sectionId; }
    public UUID           getSubjectId()      { return subjectId; }
    public UUID           getAssignedBy()     { return assignedBy; }
    public String         getTitle()          { return title; }
    public String         getDescription()    { return description; }
    public LocalDate      getDueDate()        { return dueDate; }
    public HomeworkStatus getStatus()         { return status; }
    public String         getAttachmentUrls() { return attachmentUrls; }
    public Instant        getCreatedAt()      { return createdAt; }
    public Instant        getUpdatedAt()      { return updatedAt; }

    public void setTitle(String title)               { this.title = title; }
    public void setDescription(String description)   { this.description = description; }
    public void setDueDate(LocalDate dueDate)         { this.dueDate = dueDate; }
    public void setAttachmentUrls(String urls)        { this.attachmentUrls = urls; }
}
