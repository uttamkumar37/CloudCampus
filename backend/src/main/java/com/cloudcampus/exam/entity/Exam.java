package com.cloudcampus.exam.entity;

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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * An exam definition within an academic year (CC-1101).
 *
 * Rules:
 * - {@code startDate} must be ≤ {@code endDate} (enforced in DB constraint).
 * - {@code passingMarks} must be ≤ {@code totalMarks}.
 * - Subject-level schedule is in {@link ExamSubject}.
 * - Status lifecycle: DRAFT → SCHEDULED → ONGOING → COMPLETED (or CANCELLED).
 *
 * Maps to {@code exams} (V27__create_exams.sql).
 */
@Entity
@Table(name = "exams")
@FilterDef(
        name = TenantFilter.NAME,
        parameters = @ParamDef(name = TenantFilter.PARAM, type = UUID.class)
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class Exam {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "academic_year_id", nullable = false, updatable = false)
    private UUID academicYearId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false, updatable = false, length = 50)
    private ExamType examType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ExamStatus status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_marks", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "passing_marks", nullable = false, precision = 8, scale = 2)
    private BigDecimal passingMarks;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    /** Staff member who created the exam; nullable (system-created). */
    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Exam() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static Exam create(UUID tenantId, UUID schoolId, UUID academicYearId,
                               String name, ExamType examType,
                               LocalDate startDate, LocalDate endDate,
                               BigDecimal totalMarks, BigDecimal passingMarks) {
        Exam e = new Exam();
        e.tenantId       = tenantId;
        e.schoolId       = schoolId;
        e.academicYearId = academicYearId;
        e.name           = name;
        e.examType       = examType;
        e.status         = ExamStatus.DRAFT;
        e.startDate      = startDate;
        e.endDate        = endDate;
        e.totalMarks     = totalMarks;
        e.passingMarks   = passingMarks;
        return e;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Behaviour
    // ─────────────────────────────────────────────────────────────────────────

    public void schedule() {
        this.status = ExamStatus.SCHEDULED;
    }

    public void markOngoing() {
        this.status = ExamStatus.ONGOING;
    }

    public void complete() {
        this.status = ExamStatus.COMPLETED;
    }

    public void cancel() {
        this.status = ExamStatus.CANCELLED;
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

    public UUID       getId()             { return id; }
    public UUID       getTenantId()       { return tenantId; }
    public UUID       getSchoolId()       { return schoolId; }
    public UUID       getAcademicYearId() { return academicYearId; }
    public String     getName()           { return name; }
    public ExamType   getExamType()       { return examType; }
    public ExamStatus getStatus()         { return status; }
    public LocalDate  getStartDate()      { return startDate; }
    public LocalDate  getEndDate()        { return endDate; }
    public BigDecimal getTotalMarks()     { return totalMarks; }
    public BigDecimal getPassingMarks()   { return passingMarks; }
    public String     getInstructions()   { return instructions; }
    public UUID       getCreatedBy()      { return createdBy; }
    public Instant    getCreatedAt()      { return createdAt; }
    public Instant    getUpdatedAt()      { return updatedAt; }

    public void setName(String name)                         { this.name = name; }
    public void setStartDate(LocalDate startDate)             { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate)                 { this.endDate = endDate; }
    public void setTotalMarks(BigDecimal totalMarks)          { this.totalMarks = totalMarks; }
    public void setPassingMarks(BigDecimal passingMarks)      { this.passingMarks = passingMarks; }
    public void setInstructions(String instructions)          { this.instructions = instructions; }
    public void setCreatedBy(UUID createdBy)                  { this.createdBy = createdBy; }
}
