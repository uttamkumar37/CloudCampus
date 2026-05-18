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

@Entity
@Table(name = "platform_trust_modules")
public class TrustModule {

    @Id
    private UUID id;

    @Column(name = "module_key", nullable = false, unique = true, length = 120)
    private String moduleKey;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "category", nullable = false, length = 60)
    private String category;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> evidenceJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metricsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "display_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> displayJson;

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

    protected TrustModule() {}

    public static TrustModule create(String moduleKey,
                                     String title,
                                     String category,
                                     Map<String, Object> evidenceJson,
                                     Map<String, Object> metricsJson,
                                     Map<String, Object> displayJson,
                                     UUID createdBy) {
        TrustModule module = new TrustModule();
        module.moduleKey = moduleKey;
        module.title = title;
        module.category = category;
        module.evidenceJson = evidenceJson;
        module.metricsJson = metricsJson;
        module.displayJson = displayJson;
        module.status = "DRAFT";
        module.published = false;
        module.createdBy = createdBy;
        return module;
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

    public void update(String title,
                       String category,
                       Map<String, Object> evidenceJson,
                       Map<String, Object> metricsJson,
                       Map<String, Object> displayJson) {
        this.title = title;
        this.category = category;
        this.evidenceJson = evidenceJson;
        this.metricsJson = metricsJson;
        this.displayJson = displayJson;
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
    public String getModuleKey() { return moduleKey; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getStatus() { return status; }
    public Map<String, Object> getEvidenceJson() { return evidenceJson; }
    public Map<String, Object> getMetricsJson() { return metricsJson; }
    public Map<String, Object> getDisplayJson() { return displayJson; }
    public boolean isPublished() { return published; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
