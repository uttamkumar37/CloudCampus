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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_website_templates")
public class WebsiteTemplate {

    @Id
    private UUID id;

    @Column(name = "template_key", nullable = false, unique = true, length = 120)
    private String templateKey;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "category", nullable = false, length = 60)
    private String category;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "preview_image_url", length = 500)
    private String previewImageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags_json", columnDefinition = "jsonb", nullable = false)
    private List<String> tagsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "schema_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> schemaJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "default_branding_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> defaultBrandingJson;

    @Column(name = "usage_count", nullable = false)
    private long usageCount;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WebsiteTemplate() {}

    public static WebsiteTemplate create(String templateKey,
                                         String name,
                                         String category,
                                         String previewImageUrl,
                                         List<String> tags,
                                         Map<String, Object> schemaJson,
                                         Map<String, Object> defaultBrandingJson,
                                         UUID createdBy) {
        WebsiteTemplate template = new WebsiteTemplate();
        template.templateKey = templateKey;
        template.name = name;
        template.category = category;
        template.previewImageUrl = previewImageUrl;
        template.tagsJson = tags;
        template.schemaJson = schemaJson;
        template.defaultBrandingJson = defaultBrandingJson;
        template.status = "DRAFT";
        template.usageCount = 0;
        template.published = false;
        template.createdBy = createdBy;
        return template;
    }

    @PrePersist
    void onPersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String name,
                       String category,
                       String previewImageUrl,
                       List<String> tags,
                       Map<String, Object> schemaJson,
                       Map<String, Object> defaultBrandingJson) {
        this.name = name;
        this.category = category;
        this.previewImageUrl = previewImageUrl;
        this.tagsJson = tags;
        this.schemaJson = schemaJson;
        this.defaultBrandingJson = defaultBrandingJson;
        this.status = "DRAFT";
        this.published = false;
        this.publishedAt = null;
    }

    public void publish() {
        this.status = "PUBLISHED";
        this.published = true;
        this.publishedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getTemplateKey() { return templateKey; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getStatus() { return status; }
    public String getPreviewImageUrl() { return previewImageUrl; }
    public List<String> getTagsJson() { return tagsJson; }
    public Map<String, Object> getSchemaJson() { return schemaJson; }
    public Map<String, Object> getDefaultBrandingJson() { return defaultBrandingJson; }
    public long getUsageCount() { return usageCount; }
    public boolean isPublished() { return published; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
