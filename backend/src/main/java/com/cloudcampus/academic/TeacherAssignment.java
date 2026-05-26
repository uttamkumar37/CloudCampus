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

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt;

    protected TeacherAssignment() {
    }

    public TeacherAssignment(UserAccount teacher, ClassSubjectAssignment classSubjectAssignment) {
        this.tenant = classSubjectAssignment.getTenant();
        this.school = classSubjectAssignment.getSchool();
        this.teacher = teacher;
        this.classSubjectAssignment = classSubjectAssignment;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
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

    public boolean isActive() {
        return active;
    }
}
