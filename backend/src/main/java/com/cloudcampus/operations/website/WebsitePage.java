package com.cloudcampus.operations.website;

import java.time.Instant;
import java.util.UUID;

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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "website_pages",
        uniqueConstraints = @UniqueConstraint(name = "uk_website_pages_school_slug", columnNames = {"school_id", "slug"})
)
public class WebsitePage {

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
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserAccount createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by_user_id")
    private UserAccount publishedByUser;

    @Column(nullable = false, length = 120)
    private String slug;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private WebsitePageStatus status = WebsitePageStatus.DRAFT;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant publishedAt;

    protected WebsitePage() {
    }

    public WebsitePage(School school, UserAccount createdByUser, String slug, String title, String body) {
        this.tenant = school.getTenant();
        this.school = school;
        this.createdByUser = createdByUser;
        this.slug = slug;
        this.title = title;
        this.body = body;
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
        this.status = WebsitePageStatus.PUBLISHED;
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

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public WebsitePageStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
