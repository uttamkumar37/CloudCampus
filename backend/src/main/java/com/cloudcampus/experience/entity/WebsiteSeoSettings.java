package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_website_seo_settings")
public class WebsiteSeoSettings {

    @Id
    private UUID id;

    @Column(name = "page_id")
    private UUID pageId;

    @Column(name = "route_path", nullable = false, unique = true, length = 255)
    private String routePath;

    @Column(name = "meta_title", nullable = false, length = 255)
    private String metaTitle;

    @Column(name = "meta_description", nullable = false, length = 1000)
    private String metaDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "open_graph_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> openGraphJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "twitter_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> twitterJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_data_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> structuredDataJson;

    @Column(name = "robots", nullable = false, length = 120)
    private String robots;

    @Column(name = "sitemap_priority", nullable = false)
    private BigDecimal sitemapPriority;

    @Column(name = "sitemap_change_freq", nullable = false, length = 40)
    private String sitemapChangeFreq;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected WebsiteSeoSettings() {
    }

    public static WebsiteSeoSettings create(UUID pageId,
                                            String routePath,
                                            String metaTitle,
                                            String metaDescription,
                                            Map<String, Object> openGraphJson,
                                            Map<String, Object> twitterJson,
                                            Map<String, Object> structuredDataJson,
                                            String robots,
                                            double sitemapPriority,
                                            String sitemapChangeFreq) {
        WebsiteSeoSettings settings = new WebsiteSeoSettings();
        settings.pageId = pageId;
        settings.routePath = routePath;
        settings.metaTitle = metaTitle;
        settings.metaDescription = metaDescription;
        settings.openGraphJson = openGraphJson;
        settings.twitterJson = twitterJson;
        settings.structuredDataJson = structuredDataJson;
        settings.robots = robots;
        settings.sitemapPriority = BigDecimal.valueOf(sitemapPriority);
        settings.sitemapChangeFreq = sitemapChangeFreq;
        settings.status = "DRAFT";
        settings.published = false;
        settings.deleted = false;
        return settings;
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

    public void update(UUID pageId,
                       String routePath,
                       String metaTitle,
                       String metaDescription,
                       Map<String, Object> openGraphJson,
                       Map<String, Object> twitterJson,
                       Map<String, Object> structuredDataJson,
                       String robots,
                       double sitemapPriority,
                       String sitemapChangeFreq) {
        this.pageId = pageId;
        this.routePath = routePath;
        this.metaTitle = metaTitle;
        this.metaDescription = metaDescription;
        this.openGraphJson = openGraphJson;
        this.twitterJson = twitterJson;
        this.structuredDataJson = structuredDataJson;
        this.robots = robots;
        this.sitemapPriority = BigDecimal.valueOf(sitemapPriority);
        this.sitemapChangeFreq = sitemapChangeFreq;
        this.status = "DRAFT";
        this.published = false;
        this.publishedAt = null;
    }

    public void publish() {
        this.status = "PUBLISHED";
        this.published = true;
        this.publishedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getPageId() {
        return pageId;
    }

    public String getRoutePath() {
        return routePath;
    }

    public String getMetaTitle() {
        return metaTitle;
    }

    public String getMetaDescription() {
        return metaDescription;
    }

    public Map<String, Object> getOpenGraphJson() {
        return openGraphJson;
    }

    public Map<String, Object> getTwitterJson() {
        return twitterJson;
    }

    public Map<String, Object> getStructuredDataJson() {
        return structuredDataJson;
    }

    public String getRobots() {
        return robots;
    }

    public double getSitemapPriority() {
        return sitemapPriority.doubleValue();
    }

    public String getSitemapChangeFreq() {
        return sitemapChangeFreq;
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
