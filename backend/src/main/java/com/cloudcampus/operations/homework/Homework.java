package com.cloudcampus.operations.homework;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.Subject;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "homework_assignments")
public class Homework {

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
    @JoinColumn(name = "class_level_id", nullable = false)
    private ClassLevel classLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserAccount createdByUser;

    @Column(nullable = false, length = 40)
    private String createdByRole;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 2000)
    private String instructions;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private HomeworkStatus status = HomeworkStatus.PUBLISHED;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant publishedAt;

    protected Homework() {
    }

    public Homework(
            ClassLevel classLevel,
            Section section,
            Subject subject,
            UserAccount createdByUser,
            String title,
            String instructions,
            LocalDate dueDate
    ) {
        this.tenant = classLevel.getTenant();
        this.school = classLevel.getSchool();
        this.classLevel = classLevel;
        this.section = section;
        this.subject = subject;
        this.createdByUser = createdByUser;
        this.createdByRole = createdByUser.getRole().name();
        this.title = title;
        this.instructions = instructions;
        this.dueDate = dueDate;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (publishedAt == null) {
            publishedAt = createdAt;
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

    public ClassLevel getClassLevel() {
        return classLevel;
    }

    public Section getSection() {
        return section;
    }

    public Subject getSubject() {
        return subject;
    }

    public UserAccount getCreatedByUser() {
        return createdByUser;
    }

    public String getCreatedByRole() {
        return createdByRole;
    }

    public String getTitle() {
        return title;
    }

    public String getInstructions() {
        return instructions;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public HomeworkStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
