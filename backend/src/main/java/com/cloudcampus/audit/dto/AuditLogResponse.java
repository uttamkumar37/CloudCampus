package com.cloudcampus.audit.dto;

import com.cloudcampus.audit.entity.AuditLog;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID tenantId,
        UUID actorId,
        String actorUsername,
        String category,
        String eventType,
        String resourceType,
        String resourceId,
        String description,
        Map<String, Object> metadata,
        String ipAddress,
        String userAgent,
        Instant createdAt) {

    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getTenantId(),
                log.getActorId(),
                log.getActorUsername(),
                log.getCategory(),
                log.getEventType().name(),
                log.getResourceType(),
                log.getResourceId(),
                log.getDescription(),
                log.getMetadata(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getCreatedAt());
    }
}
