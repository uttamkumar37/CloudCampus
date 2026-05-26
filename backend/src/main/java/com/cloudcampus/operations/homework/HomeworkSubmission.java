package com.cloudcampus.operations.homework;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.people.student.Student;
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
        name = "homework_submissions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_homework_submissions_homework_student",
                columnNames = {"homework_id", "student_id"}
        )
)
public class HomeworkSubmission {

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
    @JoinColumn(name = "homework_id", nullable = false)
    private Homework homework;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submitted_by_user_id", nullable = false)
    private UserAccount submittedByUser;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private Instant submittedAt;

    protected HomeworkSubmission() {
    }

    public HomeworkSubmission(Homework homework, Student student, UserAccount submittedByUser, String content) {
        this.tenant = homework.getTenant();
        this.school = homework.getSchool();
        this.homework = homework;
        this.student = student;
        this.submittedByUser = submittedByUser;
        this.content = content;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (submittedAt == null) {
            submittedAt = Instant.now();
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

    public Homework getHomework() {
        return homework;
    }

    public Student getStudent() {
        return student;
    }

    public UserAccount getSubmittedByUser() {
        return submittedByUser;
    }

    public String getContent() {
        return content;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }
}
