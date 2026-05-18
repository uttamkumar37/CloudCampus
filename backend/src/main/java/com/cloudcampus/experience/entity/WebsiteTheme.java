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
@Table(name = "platform_website_themes")
public class WebsiteTheme {

    @Id
    private UUID id;

    @Column(name = "theme_key", nullable = false, unique = true, length = 120)
    private String themeKey;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tokens_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> tokensJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "typography_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> typographyJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "effects_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> effectsJson;

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

    protected WebsiteTheme() {
    }

    public static WebsiteTheme create(String themeKey,
                                      String name,
                                      Map<String, Object> tokensJson,
                                      Map<String, Object> typographyJson,
                                      Map<String, Object> effectsJson,
                                      UUID createdBy) {
        WebsiteTheme theme = new WebsiteTheme();
        theme.themeKey = themeKey;
        theme.name = name;
        theme.tokensJson = tokensJson;
        theme.typographyJson = typographyJson;
        theme.effectsJson = effectsJson;
        theme.status = "DRAFT";
        theme.published = false;
        theme.deleted = false;
        theme.createdBy = createdBy;
        return theme;
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

    public void update(String name,
                       Map<String, Object> tokensJson,
                       Map<String, Object> typographyJson,
                       Map<String, Object> effectsJson) {
        this.name = name;
        this.tokensJson = tokensJson;
        this.typographyJson = typographyJson;
        this.effectsJson = effectsJson;
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

    public String getThemeKey() {
        return themeKey;
    }

    public String getName() {
        return name;
    }

    public String getStatus() {
        return status;
    }

    public Map<String, Object> getTokensJson() {
        return tokensJson;
    }

    public Map<String, Object> getTypographyJson() {
        return typographyJson;
    }

    public Map<String, Object> getEffectsJson() {
        return effectsJson;
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
