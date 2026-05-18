package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity(name = "ExperienceWebsitePage")
@Table(name = "platform_website_pages")
public class WebsitePage {

    @Id
    private UUID id;

    @Column(name = "page_key", nullable = false, unique = true, length = 120)
    private String pageKey;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "slug", nullable = false, unique = true, length = 160)
    private String slug;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seo_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> seoJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> settingsJson;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WebsitePage() {
    }

    public static WebsitePage create(String pageKey,
                                     String title,
                                     String slug,
                                     Map<String, Object> seoJson,
                                     Map<String, Object> settingsJson,
                                     UUID createdBy) {
        WebsitePage page = new WebsitePage();
        page.pageKey = pageKey;
        page.title = title;
        page.slug = slug;
        page.seoJson = seoJson;
        page.settingsJson = settingsJson;
        page.status = "DRAFT";
        page.version = 1;
        page.published = false;
        page.deleted = false;
        page.createdBy = createdBy;
        return page;
    }

    @PrePersist
    void onPersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String title,
                       String slug,
                       Map<String, Object> seoJson,
                       Map<String, Object> settingsJson) {
        this.title = title;
        this.slug = slug;
        this.seoJson = seoJson;
        this.settingsJson = settingsJson;
        this.version += 1;
        this.status = "DRAFT";
        this.published = false;
        this.publishedAt = null;
    }

    public void publish() {
        this.status = "PUBLISHED";
        this.published = true;
        this.publishedAt = Instant.now();
    }

    public void restorePublishedState(boolean published) {
        if (published) {
            publish();
        } else {
            this.status = "DRAFT";
            this.published = false;
            this.publishedAt = null;
        }
    }

    public UUID getId() {
        return id;
    }

    public String getPageKey() {
        return pageKey;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getStatus() {
        return status;
    }

    public Map<String, Object> getSeoJson() {
        return seoJson;
    }

    public Map<String, Object> getSettingsJson() {
        return settingsJson;
    }

    public int getVersion() {
        return version;
    }

    public boolean isPublished() {
        return published;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
