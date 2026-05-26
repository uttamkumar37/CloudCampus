package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
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
@Table(name = "exams")
public class Exam {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by_user_id")
    private UserAccount publishedByUser;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false)
    private LocalDate examDate;

    @Column(nullable = false, precision = 7, scale = 2)
    private BigDecimal maxMarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ExamStatus status = ExamStatus.DRAFT;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant publishedAt;

    protected Exam() {
    }

    public Exam(
            ClassLevel classLevel,
            Section section,
            Subject subject,
            UserAccount createdByUser,
            String title,
            LocalDate examDate,
            BigDecimal maxMarks
    ) {
        this.tenant = classLevel.getTenant();
        this.school = classLevel.getSchool();
        this.classLevel = classLevel;
        this.section = section;
        this.subject = subject;
        this.createdByUser = createdByUser;
        this.title = title;
        this.examDate = examDate;
        this.maxMarks = maxMarks;
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

    public void publish(UserAccount actor, Instant publishedAt) {
        this.status = ExamStatus.PUBLISHED;
        this.publishedByUser = actor;
        this.publishedAt = publishedAt;
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

    public UserAccount getPublishedByUser() {
        return publishedByUser;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public BigDecimal getMaxMarks() {
        return maxMarks;
    }

    public ExamStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
