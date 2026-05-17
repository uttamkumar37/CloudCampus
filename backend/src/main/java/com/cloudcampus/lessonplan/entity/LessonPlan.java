package com.cloudcampus.lessonplan.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "lesson_plans")
public class LessonPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "class_id")
    private UUID classId;

    @Column(name = "section_id")
    private UUID sectionId;

    @Column(name = "subject_id")
    private UUID subjectId;

    @Column(name = "academic_year_id")
    private UUID academicYearId;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @Column(name = "period_number")
    private Integer periodNumber;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(columnDefinition = "TEXT")
    private String activities;

    @Column(columnDefinition = "TEXT")
    private String materials;

    @Column(name = "homework_note", columnDefinition = "TEXT")
    private String homeworkNote;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LessonPlanStatus status = LessonPlanStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public static LessonPlan create(UUID tenantId, UUID schoolId, UUID staffId,
                                    UUID classId, UUID sectionId, UUID subjectId,
                                    UUID academicYearId, LocalDate planDate,
                                    Integer periodNumber, String topic,
                                    String objectives, String activities,
                                    String materials, String homeworkNote) {
        LessonPlan lp = new LessonPlan();
        lp.tenantId       = tenantId;
        lp.schoolId       = schoolId;
        lp.staffId        = staffId;
        lp.classId        = classId;
        lp.sectionId      = sectionId;
        lp.subjectId      = subjectId;
        lp.academicYearId = academicYearId;
        lp.planDate       = planDate;
        lp.periodNumber   = periodNumber;
        lp.topic          = topic;
        lp.objectives     = objectives;
        lp.activities     = activities;
        lp.materials      = materials;
        lp.homeworkNote   = homeworkNote;
        return lp;
    }

    public void publish() {
        this.status    = LessonPlanStatus.PUBLISHED;
        this.updatedAt = Instant.now();
    }

    public void update(String topic, String objectives, String activities,
                       String materials, String homeworkNote, Integer periodNumber) {
        this.topic        = topic;
        this.objectives   = objectives;
        this.activities   = activities;
        this.materials    = materials;
        this.homeworkNote = homeworkNote;
        this.periodNumber = periodNumber;
        this.updatedAt    = Instant.now();
    }

    // ── Getters ────────────────────────────────────────────────────────────────
    public UUID getId()              { return id; }
    public UUID getTenantId()        { return tenantId; }
    public UUID getSchoolId()        { return schoolId; }
    public UUID getStaffId()         { return staffId; }
    public UUID getClassId()         { return classId; }
    public UUID getSectionId()       { return sectionId; }
    public UUID getSubjectId()       { return subjectId; }
    public UUID getAcademicYearId()  { return academicYearId; }
    public LocalDate getPlanDate()   { return planDate; }
    public Integer getPeriodNumber() { return periodNumber; }
    public String getTopic()         { return topic; }
    public String getObjectives()    { return objectives; }
    public String getActivities()    { return activities; }
    public String getMaterials()     { return materials; }
    public String getHomeworkNote()  { return homeworkNote; }
    public LessonPlanStatus getStatus() { return status; }
    public Instant getCreatedAt()    { return createdAt; }
    public Instant getUpdatedAt()    { return updatedAt; }
}
