package com.cloudcampus.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "website_pages")
public class WebsitePage {

    @Id private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "slug", nullable = false, length = 200)
    private String slug;

    @Column(name = "seo_title", length = 200)
    private String seoTitle;

    @Column(name = "seo_description", length = 500)
    private String seoDescription;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WebsitePage() {}

    public static WebsitePage create(UUID tenantId, UUID schoolId,
                                      String title, String slug, int displayOrder) {
        WebsitePage p = new WebsitePage();
        p.tenantId     = tenantId;
        p.schoolId     = schoolId;
        p.title        = title;
        p.slug         = slug;
        p.displayOrder = displayOrder;
        p.published    = false;
        return p;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public void setTitle(String title)              { this.title        = title; }
    public void setSlug(String slug)                { this.slug         = slug; }
    public void setSeoTitle(String t)               { this.seoTitle     = t; }
    public void setSeoDescription(String d)         { this.seoDescription = d; }
    public void setPublished(boolean published)     { this.published    = published; }
    public void setDisplayOrder(int displayOrder)   { this.displayOrder = displayOrder; }

    public UUID    getId()             { return id; }
    public UUID    getTenantId()       { return tenantId; }
    public UUID    getSchoolId()       { return schoolId; }
    public String  getTitle()          { return title; }
    public String  getSlug()           { return slug; }
    public String  getSeoTitle()       { return seoTitle; }
    public String  getSeoDescription() { return seoDescription; }
    public boolean isPublished()       { return published; }
    public int     getDisplayOrder()   { return displayOrder; }
    public Instant getCreatedAt()      { return createdAt; }
    public Instant getUpdatedAt()      { return updatedAt; }
}
