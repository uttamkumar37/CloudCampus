package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_presentations")
public class Presentation {

    @Id private UUID id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "slug", nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "audience_type", nullable = false, length = 40)
    private String audienceType;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metaJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "branding_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> brandingJson;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Presentation() {}

    public static Presentation create(String title, String slug, String audienceType, UUID createdBy) {
        Presentation p = new Presentation();
        p.title        = title;
        p.slug         = slug;
        p.audienceType = audienceType;
        p.status       = "DRAFT";
        p.metaJson     = Map.of();
        p.brandingJson = Map.of();
        p.createdBy    = createdBy;
        return p;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public void publish()  { this.status = "PUBLISHED"; }
    public void archive()  { this.status = "ARCHIVED"; }
    public void setTitle(String title) { this.title = title; }
    public void setMetaJson(Map<String, Object> m) { this.metaJson = m; }
    public void setBrandingJson(Map<String, Object> b) { this.brandingJson = b; }

    public UUID                getId()           { return id; }
    public String              getTitle()        { return title; }
    public String              getSlug()         { return slug; }
    public String              getAudienceType() { return audienceType; }
    public String              getStatus()       { return status; }
    public Map<String, Object> getMetaJson()     { return metaJson; }
    public Map<String, Object> getBrandingJson() { return brandingJson; }
    public UUID                getCreatedBy()    { return createdBy; }
    public Instant             getCreatedAt()    { return createdAt; }
    public Instant             getUpdatedAt()    { return updatedAt; }
}
