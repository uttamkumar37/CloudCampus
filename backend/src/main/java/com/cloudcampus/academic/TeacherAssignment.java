package com.cloudcampus.academic;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "teacher_assignments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_teacher_assignments_teacher_class_subject",
                columnNames = {"teacher_user_id", "class_subject_assignment_id"}
        )
)
public class TeacherAssignment {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_user_id", nullable = false)
    private UserAccount teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_subject_assignment_id", nullable = false)
    private ClassSubjectAssignment classSubjectAssignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private ClassLevel classLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(length = 40)
    private String roleType;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

    protected TeacherAssignment() {
    }

    public TeacherAssignment(UserAccount teacher, ClassSubjectAssignment classSubjectAssignment) {
        this.tenant = classSubjectAssignment.getTenant();
        this.school = classSubjectAssignment.getSchool();
        this.teacher = teacher;
        this.classSubjectAssignment = classSubjectAssignment;
        this.classLevel = classSubjectAssignment.getClassLevel();
        this.subject = classSubjectAssignment.getSubject();
        this.roleType = "SUBJECT_TEACHER";
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
    }

    public void updateScope(Section section, String roleType, boolean active, UserAccount actor) {
        this.section = section;
        if (roleType != null && !roleType.isBlank()) {
            this.roleType = roleType.trim();
        }
        this.active = active;
        this.updatedBy = actor;
        this.updatedAt = Instant.now();
    }

    public void deactivate(UserAccount actor) {
        this.active = false;
        this.updatedBy = actor;
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public UserAccount getTeacher() {
        return teacher;
    }

    public ClassSubjectAssignment getClassSubjectAssignment() {
        return classSubjectAssignment;
    }

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public ClassLevel getClassLevel() {
        return classLevel;
    }

    public Section getSection() {
        return section;
    }

    public Subject getSubject() {
        return subject;
    }

    public String getRoleType() {
        return roleType;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
