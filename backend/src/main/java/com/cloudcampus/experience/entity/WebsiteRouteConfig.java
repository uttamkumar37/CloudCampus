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
@Table(name = "platform_website_routes")
public class WebsiteRouteConfig {

    @Id
    private UUID id;

    @Column(name = "route_path", nullable = false, unique = true, length = 255)
    private String routePath;

    @Column(name = "audience_type", nullable = false, length = 50)
    private String audienceType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seo_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> seoJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> layoutJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cta_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> ctaJson;

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

    protected WebsiteRouteConfig() {}

    public static WebsiteRouteConfig create(String routePath,
                                            String audienceType,
                                            String title,
                                            Map<String, Object> seoJson,
                                            Map<String, Object> layoutJson,
                                            Map<String, Object> ctaJson,
                                            UUID createdBy) {
        WebsiteRouteConfig route = new WebsiteRouteConfig();
        route.routePath = routePath;
        route.audienceType = audienceType;
        route.title = title;
        route.status = "DRAFT";
        route.seoJson = seoJson;
        route.layoutJson = layoutJson;
        route.ctaJson = ctaJson;
        route.published = false;
        route.createdBy = createdBy;
        return route;
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

    public void update(String audienceType,
                       String title,
                       Map<String, Object> seoJson,
                       Map<String, Object> layoutJson,
                       Map<String, Object> ctaJson) {
        this.audienceType = audienceType;
        this.title = title;
        this.seoJson = seoJson;
        this.layoutJson = layoutJson;
        this.ctaJson = ctaJson;
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
    public String getRoutePath() { return routePath; }
    public String getAudienceType() { return audienceType; }
    public String getTitle() { return title; }
    public String getStatus() { return status; }
    public Map<String, Object> getSeoJson() { return seoJson; }
    public Map<String, Object> getLayoutJson() { return layoutJson; }
    public Map<String, Object> getCtaJson() { return ctaJson; }
    public boolean isPublished() { return published; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
