package com.cloudcampus.notice.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "school_notices")
@FilterDef(
        name = TenantFilter.NAME,
        parameters = @ParamDef(name = TenantFilter.PARAM, type = UUID.class)
)
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class SchoolNotice {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private NoticeCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "target", nullable = false, length = 20)
    private NoticeTarget target;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "posted_by")
    private UUID postedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SchoolNotice() {}

    public static SchoolNotice create(UUID tenantId, UUID schoolId, String title,
                                      String content, NoticeCategory category,
                                      NoticeTarget target, int priority,
                                      Instant expiresAt, UUID postedBy,
                                      boolean publishImmediately) {
        SchoolNotice n = new SchoolNotice();
        n.tenantId   = tenantId;
        n.schoolId   = schoolId;
        n.title      = title;
        n.content    = content;
        n.category   = category;
        n.target     = target;
        n.priority   = priority;
        n.expiresAt  = expiresAt;
        n.postedBy   = postedBy;
        n.published  = publishImmediately;
        n.publishedAt = publishImmediately ? Instant.now() : null;
        return n;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }

    public void publish() {
        this.published  = true;
        this.publishedAt = Instant.now();
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public UUID           getId()          { return id; }
    public UUID           getTenantId()    { return tenantId; }
    public UUID           getSchoolId()    { return schoolId; }
    public String         getTitle()       { return title; }
    public String         getContent()     { return content; }
    public NoticeCategory getCategory()    { return category; }
    public NoticeTarget   getTarget()      { return target; }
    public int            getPriority()    { return priority; }
    public boolean        isPublished()    { return published; }
    public Instant        getPublishedAt() { return publishedAt; }
    public Instant        getExpiresAt()   { return expiresAt; }
    public UUID           getPostedBy()    { return postedBy; }
    public Instant        getCreatedAt()   { return createdAt; }
    public Instant        getUpdatedAt()   { return updatedAt; }
}
