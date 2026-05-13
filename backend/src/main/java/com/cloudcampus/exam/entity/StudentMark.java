package com.cloudcampus.exam.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * One mark entry per student per exam paper (CC-1102).
 *
 * Rules:
 * - {@code marksObtained} is nullable — NULL means not yet recorded.
 * - {@code isAbsent} = true means student was absent; marks stored as 0.
 * - {@code examId} is denormalised for efficient cross-subject result queries (E17).
 * - Unique per (exam_subject_id, student_id) — enforced at DB level.
 *
 * Maps to {@code student_marks} (V29__create_student_marks.sql).
 */
@Entity
@Table(name = "student_marks")
@Filter(name = TenantFilter.NAME, condition = "tenant_id = :" + TenantFilter.PARAM)
public class StudentMark {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "exam_id", nullable = false, updatable = false)
    private UUID examId;

    @Column(name = "exam_subject_id", nullable = false, updatable = false)
    private UUID examSubjectId;

    @Column(name = "student_id", nullable = false, updatable = false)
    private UUID studentId;

    @Column(name = "marks_obtained", precision = 8, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "is_absent", nullable = false)
    private boolean absent;

    @Column(name = "remarks", columnDefinition = "text")
    private String remarks;

    @Column(name = "entered_by")
    private UUID enteredBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StudentMark() {}

    @PrePersist
    private void prePersist() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = Instant.now();
    }

    // ── Factory ───────────────────────────────────────────────────────────────

    /**
     * Create a new mark entry.
     *
     * @param tenantId       tenant scope
     * @param examId         parent exam (denormalised)
     * @param examSubjectId  the specific paper
     * @param studentId      student being assessed
     * @param marksObtained  actual marks (null if not yet entered, 0 if absent)
     * @param absent         whether student was absent
     * @param remarks        optional invigilator/teacher remark
     * @param enteredBy      staff UUID who is saving the record
     */
    public static StudentMark create(
            UUID tenantId,
            UUID examId,
            UUID examSubjectId,
            UUID studentId,
            BigDecimal marksObtained,
            boolean absent,
            String remarks,
            UUID enteredBy) {

        StudentMark sm = new StudentMark();
        sm.tenantId      = tenantId;
        sm.examId        = examId;
        sm.examSubjectId = examSubjectId;
        sm.studentId     = studentId;
        sm.marksObtained = marksObtained;
        sm.absent        = absent;
        sm.remarks       = remarks;
        sm.enteredBy     = enteredBy;
        return sm;
    }

    // ── Behaviour ─────────────────────────────────────────────────────────────

    public void update(BigDecimal marksObtained, boolean absent, String remarks, UUID enteredBy) {
        this.marksObtained = marksObtained;
        this.absent        = absent;
        this.remarks       = remarks;
        this.enteredBy     = enteredBy;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public UUID        getId()             { return id; }
    public UUID        getTenantId()       { return tenantId; }
    public UUID        getExamId()         { return examId; }
    public UUID        getExamSubjectId()  { return examSubjectId; }
    public UUID        getStudentId()      { return studentId; }
    public BigDecimal  getMarksObtained()  { return marksObtained; }
    public boolean     isAbsent()          { return absent; }
    public String      getRemarks()        { return remarks; }
    public UUID        getEnteredBy()      { return enteredBy; }
    public Instant     getCreatedAt()      { return createdAt; }
    public Instant     getUpdatedAt()      { return updatedAt; }
}
