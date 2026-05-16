package com.cloudcampus.website.entity;

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

/**
 * A content block within a page. section_type drives how the frontend renders it.
 *
 * Supported types: HERO | TEXT | STATS | GALLERY | CTA | CONTACT
 * content is a free-form JSONB map — structure varies per section_type.
 */
@Entity
@Table(name = "website_sections")
public class WebsiteSection {

    @Id private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "page_id", nullable = false, updatable = false)
    private UUID pageId;

    @Column(name = "section_type", nullable = false, length = 50)
    private String sectionType;

    @Column(name = "position", nullable = false)
    private int position;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> content;

    @Column(name = "visible", nullable = false)
    private boolean visible;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WebsiteSection() {}

    public static WebsiteSection create(UUID tenantId, UUID pageId,
                                         String sectionType, int position,
                                         Map<String, Object> content) {
        WebsiteSection s = new WebsiteSection();
        s.tenantId    = tenantId;
        s.pageId      = pageId;
        s.sectionType = sectionType;
        s.position    = position;
        s.content     = content;
        s.visible     = true;
        return s;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (content   == null) content   = Map.of();
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public void setSectionType(String t)               { this.sectionType = t; }
    public void setPosition(int position)              { this.position    = position; }
    public void setContent(Map<String, Object> content){ this.content     = content; }
    public void setVisible(boolean visible)            { this.visible     = visible; }

    public UUID                getId()          { return id; }
    public UUID                getTenantId()    { return tenantId; }
    public UUID                getPageId()      { return pageId; }
    public String              getSectionType() { return sectionType; }
    public int                 getPosition()    { return position; }
    public Map<String, Object> getContent()     { return content; }
    public boolean             isVisible()      { return visible; }
    public Instant             getCreatedAt()   { return createdAt; }
    public Instant             getUpdatedAt()   { return updatedAt; }
}
