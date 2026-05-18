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
@Table(name = "platform_brand_systems")
public class BrandSystem {

    @Id
    private UUID id;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "code", nullable = false, length = 80, unique = true)
    private String code;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "token_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> tokenJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "typography_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> typographyJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "motion_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> motionJson;

    @Column(name = "version", nullable = false)
    private int version;

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

    protected BrandSystem() {}

    public static BrandSystem create(String name,
                                     String code,
                                     Map<String, Object> tokenJson,
                                     Map<String, Object> typographyJson,
                                     Map<String, Object> motionJson,
                                     UUID createdBy) {
        BrandSystem b = new BrandSystem();
        b.name = name;
        b.code = code;
        b.status = "DRAFT";
        b.tokenJson = tokenJson;
        b.typographyJson = typographyJson;
        b.motionJson = motionJson;
        b.version = 1;
        b.published = false;
        b.createdBy = createdBy;
        return b;
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
                       Map<String, Object> tokenJson,
                       Map<String, Object> typographyJson,
                       Map<String, Object> motionJson) {
        this.name = name;
        this.tokenJson = tokenJson;
        this.typographyJson = typographyJson;
        this.motionJson = motionJson;
        this.version = this.version + 1;
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
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getStatus() { return status; }
    public Map<String, Object> getTokenJson() { return tokenJson; }
    public Map<String, Object> getTypographyJson() { return typographyJson; }
    public Map<String, Object> getMotionJson() { return motionJson; }
    public int getVersion() { return version; }
    public boolean isPublished() { return published; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
