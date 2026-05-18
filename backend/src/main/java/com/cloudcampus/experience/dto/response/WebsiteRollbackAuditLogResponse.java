package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteRollbackAuditLog;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsiteRollbackAuditLogResponse(
        UUID id,
        UUID snapshotId,
        String snapshotLabel,
        UUID actorId,
        Map<String, Object> restoredCountsJson,
        Instant createdAt
) {
    public static WebsiteRollbackAuditLogResponse from(WebsiteRollbackAuditLog log) {
        return new WebsiteRollbackAuditLogResponse(
                log.getId(),
                log.getSnapshotId(),
                log.getSnapshotLabel(),
                log.getActorId(),
                log.getRestoredCountsJson(),
                log.getCreatedAt()
        );
    }
}
