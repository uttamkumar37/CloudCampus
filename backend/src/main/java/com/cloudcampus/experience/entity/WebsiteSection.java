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

@Entity(name = "ExperienceWebsiteSection")
@Table(name = "platform_website_sections")
public class WebsiteSection {

    @Id
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Column(name = "section_key", nullable = false, length = 120)
    private String sectionKey;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "section_type", nullable = false, length = 80)
    private String sectionType;

    @Column(name = "position", nullable = false)
    private int position;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> configJson;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

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

    protected WebsiteSection() {
    }

    public static WebsiteSection create(UUID pageId,
                                        String sectionKey,
                                        String title,
                                        String sectionType,
                                        int position,
                                        Map<String, Object> configJson,
                                        UUID createdBy) {
        WebsiteSection section = new WebsiteSection();
        section.pageId = pageId;
        section.sectionKey = sectionKey;
        section.title = title;
        section.sectionType = sectionType;
        section.position = position;
        section.configJson = configJson;
        section.status = "DRAFT";
        section.published = false;
        section.deleted = false;
        section.createdBy = createdBy;
        return section;
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

    public void update(String title, String sectionType, int position, Map<String, Object> configJson) {
        this.title = title;
        this.sectionType = sectionType;
        this.position = position;
        this.configJson = configJson;
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

    public UUID getPageId() {
        return pageId;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public String getTitle() {
        return title;
    }

    public String getSectionType() {
        return sectionType;
    }

    public int getPosition() {
        return position;
    }

    public Map<String, Object> getConfigJson() {
        return configJson;
    }

    public String getStatus() {
        return status;
    }

    public boolean isPublished() {
        return published;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
