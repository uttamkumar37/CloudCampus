package com.cloudcampus.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** One website per school. Acts as the root for pages and nav. */
@Entity
@Table(name = "websites")
public class Website {

    @Id private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Website() {}

    public static Website create(UUID tenantId, UUID schoolId) {
        Website w = new Website();
        w.tenantId  = tenantId;
        w.schoolId  = schoolId;
        w.published = false;
        return w;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public void setPublished(boolean published) { this.published = published; }

    public UUID    getId()        { return id; }
    public UUID    getTenantId()  { return tenantId; }
    public UUID    getSchoolId()  { return schoolId; }
    public boolean isPublished()  { return published; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
