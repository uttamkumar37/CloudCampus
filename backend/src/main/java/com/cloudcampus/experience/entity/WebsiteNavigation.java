package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "platform_website_navigation")
public class WebsiteNavigation {

    @Id
    private UUID id;

    @Column(name = "label", nullable = false, length = 120)
    private String label;

    @Column(name = "path", nullable = false, length = 255)
    private String path;

    @Column(name = "target", nullable = false, length = 20)
    private String target;

    @Column(name = "group_name", nullable = false, length = 80)
    private String groupName;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "visible", nullable = false)
    private boolean visible;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

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

    protected WebsiteNavigation() {
    }

    public static WebsiteNavigation create(String label,
                                           String path,
                                           String target,
                                           String groupName,
                                           int position,
                                           boolean visible,
                                           UUID createdBy) {
        WebsiteNavigation item = new WebsiteNavigation();
        item.label = label;
        item.path = path;
        item.target = target;
        item.groupName = groupName;
        item.position = position;
        item.visible = visible;
        item.status = "DRAFT";
        item.published = false;
        item.deleted = false;
        item.createdBy = createdBy;
        return item;
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

    public void update(String label, String path, String target, String groupName, int position, boolean visible) {
        this.label = label;
        this.path = path;
        this.target = target;
        this.groupName = groupName;
        this.position = position;
        this.visible = visible;
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

    public String getLabel() {
        return label;
    }

    public String getPath() {
        return path;
    }

    public String getTarget() {
        return target;
    }

    public String getGroupName() {
        return groupName;
    }

    public int getPosition() {
        return position;
    }

    public boolean isVisible() {
        return visible;
    }

    public String getStatus() {
        return status;
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
