package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_content_blocks")
public class ContentBlock {

    @Id private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "block_key", nullable = false, length = 120)
    private String blockKey;

    @Column(name = "block_type", nullable = false, length = 40)
    private String blockType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> contentJson;

    @Column(name = "locale", nullable = false, length = 10)
    private String locale;

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

    protected ContentBlock() {}

    public static ContentBlock create(UUID tenantId, String blockKey, String blockType,
                                      Map<String, Object> content, String locale, UUID createdBy) {
        ContentBlock b = new ContentBlock();
        b.tenantId    = tenantId;
        b.blockKey    = blockKey;
        b.blockType   = blockType;
        b.contentJson = content;
        b.locale      = locale;
        b.version     = 1;
        b.published   = false;
        b.createdBy   = createdBy;
        return b;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public void publish() {
        this.published   = true;
        this.publishedAt = Instant.now();
    }

    public void updateContent(Map<String, Object> content) { this.contentJson = content; }

    public UUID                getId()          { return id; }
    public UUID                getTenantId()    { return tenantId; }
    public String              getBlockKey()    { return blockKey; }
    public String              getBlockType()   { return blockType; }
    public Map<String, Object> getContentJson() { return contentJson; }
    public String              getLocale()      { return locale; }
    public int                 getVersion()     { return version; }
    public boolean             isPublished()    { return published; }
    public Instant             getPublishedAt() { return publishedAt; }
    public UUID                getCreatedBy()   { return createdBy; }
    public Instant             getCreatedAt()   { return createdAt; }
    public Instant             getUpdatedAt()   { return updatedAt; }
}
