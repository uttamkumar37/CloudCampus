package com.cloudcampus.audit;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "school_id", length = 36)
    private String schoolId;

    @Column(name = "actor_type", nullable = false, length = 80)
    private String actorType;

    @Column(name = "actor_id", length = 36)
    private String actorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 80)
    private AuditAction action;

    @Column(name = "entity_type", nullable = false, length = 80)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 36)
    private String entityId;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "correlation_id", length = 80)
    private String correlationId;

    @Column(nullable = false)
    private Instant createdAt;

    protected AuditLog() {
    }

    public AuditLog(
            String tenantId,
            String schoolId,
            String actorType,
            String actorId,
            AuditAction action,
            String entityType,
            String entityId,
            String summary,
            String metadataJson,
            String correlationId
    ) {
        this.tenantId = tenantId;
        this.schoolId = schoolId;
        this.actorType = actorType;
        this.actorId = actorId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.summary = summary;
        this.metadataJson = metadataJson;
        this.correlationId = correlationId;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public String getActorType() {
        return actorType;
    }

    public String getActorId() {
        return actorId;
    }

    public AuditAction getAction() {
        return action;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public String getSummary() {
        return summary;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
