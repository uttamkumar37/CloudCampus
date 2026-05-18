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
@Table(name = "platform_website_audit_timeline")
public class WebsiteAuditTimelineEvent {

    @Id
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;

    @Column(name = "resource_type", nullable = false, length = 60)
    private String resourceType;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "resource_label", nullable = false, length = 255)
    private String resourceLabel;

    @Column(name = "actor_id")
    private UUID actorId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> detailsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected WebsiteAuditTimelineEvent() {
    }

    public static WebsiteAuditTimelineEvent create(String eventType,
                                                   String resourceType,
                                                   UUID resourceId,
                                                   String resourceLabel,
                                                   UUID actorId,
                                                   Map<String, Object> detailsJson) {
        WebsiteAuditTimelineEvent event = new WebsiteAuditTimelineEvent();
        event.eventType = eventType;
        event.resourceType = resourceType;
        event.resourceId = resourceId;
        event.resourceLabel = resourceLabel;
        event.actorId = actorId;
        event.detailsJson = detailsJson == null ? Map.of() : detailsJson;
        return event;
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

    public String getEventType() {
        return eventType;
    }

    public String getResourceType() {
        return resourceType;
    }

    public UUID getResourceId() {
        return resourceId;
    }

    public String getResourceLabel() {
        return resourceLabel;
    }

    public UUID getActorId() {
        return actorId;
    }

    public Map<String, Object> getDetailsJson() {
        return detailsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
