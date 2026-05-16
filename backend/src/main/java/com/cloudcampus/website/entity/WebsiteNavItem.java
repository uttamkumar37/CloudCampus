package com.cloudcampus.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "website_nav_items")
public class WebsiteNavItem {

    @Id private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "page_id")
    private UUID pageId;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected WebsiteNavItem() {}

    public static WebsiteNavItem create(UUID tenantId, UUID schoolId,
                                         String label, String url, UUID pageId,
                                         int position, UUID parentId) {
        WebsiteNavItem n = new WebsiteNavItem();
        n.tenantId = tenantId;
        n.schoolId = schoolId;
        n.label    = label;
        n.url      = url;
        n.pageId   = pageId;
        n.position = position;
        n.parentId = parentId;
        return n;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public void setLabel(String label)     { this.label    = label; }
    public void setUrl(String url)         { this.url      = url; }
    public void setPageId(UUID pageId)     { this.pageId   = pageId; }
    public void setPosition(int position)  { this.position = position; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }

    public UUID    getId()        { return id; }
    public UUID    getTenantId()  { return tenantId; }
    public UUID    getSchoolId()  { return schoolId; }
    public String  getLabel()     { return label; }
    public String  getUrl()       { return url; }
    public UUID    getPageId()    { return pageId; }
    public int     getPosition()  { return position; }
    public UUID    getParentId()  { return parentId; }
    public Instant getCreatedAt() { return createdAt; }
}
