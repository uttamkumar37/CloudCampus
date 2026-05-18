package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_website_publish_snapshots")
public class WebsitePublishSnapshot {

    @Id
    private UUID id;

    @Column(name = "version_label", nullable = false, length = 120)
    private String versionLabel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> snapshotJson;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected WebsitePublishSnapshot() {
    }

    public static WebsitePublishSnapshot create(String versionLabel, Map<String, Object> snapshotJson, UUID createdBy) {
        WebsitePublishSnapshot snapshot = new WebsitePublishSnapshot();
        snapshot.versionLabel = versionLabel;
        snapshot.snapshotJson = snapshotJson;
        snapshot.createdBy = createdBy;
        return snapshot;
    }

    @PrePersist
    void onPersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public String getVersionLabel() {
        return versionLabel;
    }

    public Map<String, Object> getSnapshotJson() {
        return snapshotJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
