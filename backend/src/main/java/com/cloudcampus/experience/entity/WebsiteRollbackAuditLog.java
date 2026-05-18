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
@Table(name = "platform_website_rollback_audit_log")
public class WebsiteRollbackAuditLog {

    @Id
    private UUID id;

    @Column(name = "snapshot_id", nullable = false)
    private UUID snapshotId;

    @Column(name = "snapshot_label", nullable = false, length = 120)
    private String snapshotLabel;

    @Column(name = "actor_id")
    private UUID actorId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "restored_counts_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> restoredCountsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected WebsiteRollbackAuditLog() {
    }

    public static WebsiteRollbackAuditLog create(UUID snapshotId,
                                                 String snapshotLabel,
                                                 UUID actorId,
                                                 Map<String, Object> restoredCountsJson) {
        WebsiteRollbackAuditLog log = new WebsiteRollbackAuditLog();
        log.snapshotId = snapshotId;
        log.snapshotLabel = snapshotLabel;
        log.actorId = actorId;
        log.restoredCountsJson = restoredCountsJson;
        return log;
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

    public UUID getSnapshotId() {
        return snapshotId;
    }

    public String getSnapshotLabel() {
        return snapshotLabel;
    }

    public UUID getActorId() {
        return actorId;
    }

    public Map<String, Object> getRestoredCountsJson() {
        return restoredCountsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
