package com.cloudcampus.exam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Subject-level schedule entry within an exam (CC-1101).
 *
 * Each row links one subject to an exam and records the paper date, duration,
 * marks breakdown, room number, and invigilator.
 *
 * Note: No @FilterDef here — exam_subjects are accessed only through their
 * parent {@link Exam} which is already tenant-filtered. Queries in the
 * repository always join via exam_id.
 *
 * Maps to {@code exam_subjects} (V28__create_exam_subjects.sql).
 */
@Entity
@Table(name = "exam_subjects")
public class ExamSubject {

    @Id
    private UUID id;

    @Column(name = "exam_id", nullable = false, updatable = false)
    private UUID examId;

    @Column(name = "subject_id", nullable = false, updatable = false)
    private UUID subjectId;

    @Column(name = "class_id", nullable = false, updatable = false)
    private UUID classId;

    /** Null = all sections of the class. */
    @Column(name = "section_id")
    private UUID sectionId;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_marks", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "passing_marks", nullable = false, precision = 8, scale = 2)
    private BigDecimal passingMarks;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Column(name = "invigilator_id")
    private UUID invigilatorId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ExamSubject() {}

    // ─────────────────────────────────────────────────────────────────────────
    // Factory
    // ─────────────────────────────────────────────────────────────────────────

    public static ExamSubject create(UUID examId, UUID subjectId, UUID classId,
                                      LocalDate examDate,
                                      BigDecimal totalMarks, BigDecimal passingMarks) {
        ExamSubject es = new ExamSubject();
        es.examId       = examId;
        es.subjectId    = subjectId;
        es.classId      = classId;
        es.examDate     = examDate;
        es.totalMarks   = totalMarks;
        es.passingMarks = passingMarks;
        return es;
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

    public UUID       getId()              { return id; }
    public UUID       getExamId()          { return examId; }
    public UUID       getSubjectId()       { return subjectId; }
    public UUID       getClassId()         { return classId; }
    public UUID       getSectionId()       { return sectionId; }
    public LocalDate  getExamDate()        { return examDate; }
    public LocalTime  getStartTime()       { return startTime; }
    public Integer    getDurationMinutes() { return durationMinutes; }
    public BigDecimal getTotalMarks()      { return totalMarks; }
    public BigDecimal getPassingMarks()    { return passingMarks; }
    public String     getRoomNumber()      { return roomNumber; }
    public UUID       getInvigilatorId()   { return invigilatorId; }
    public Instant    getCreatedAt()       { return createdAt; }
    public Instant    getUpdatedAt()       { return updatedAt; }

    public void setSectionId(UUID sectionId)             { this.sectionId = sectionId; }
    public void setStartTime(LocalTime startTime)         { this.startTime = startTime; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setRoomNumber(String roomNumber)           { this.roomNumber = roomNumber; }
    public void setInvigilatorId(UUID invigilatorId)      { this.invigilatorId = invigilatorId; }
    public void setExamDate(LocalDate examDate)            { this.examDate = examDate; }
    public void setTotalMarks(BigDecimal totalMarks)       { this.totalMarks = totalMarks; }
    public void setPassingMarks(BigDecimal passingMarks)   { this.passingMarks = passingMarks; }
}
