package com.cloudcampus.operations.notice;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.Section;
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
@Table(name = "notices")
public class Notice {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_level_id")
    private ClassLevel classLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserAccount createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by_user_id")
    private UserAccount publishedByUser;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 4000)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NoticeAudience audience;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NoticeStatus status = NoticeStatus.DRAFT;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant publishedAt;

    protected Notice() {
    }

    public Notice(
            School school,
            ClassLevel classLevel,
            Section section,
            UserAccount createdByUser,
            String title,
            String body,
            NoticeAudience audience
    ) {
        this.tenant = school.getTenant();
        this.school = school;
        this.classLevel = classLevel;
        this.section = section;
        this.createdByUser = createdByUser;
        this.title = title;
        this.body = body;
        this.audience = audience;
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
        this.status = NoticeStatus.PUBLISHED;
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

    public UserAccount getCreatedByUser() {
        return createdByUser;
    }

    public UserAccount getPublishedByUser() {
        return publishedByUser;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public NoticeAudience getAudience() {
        return audience;
    }

    public NoticeStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
