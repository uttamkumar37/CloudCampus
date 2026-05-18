package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteAuditTimelineEvent;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsiteAuditTimelineEventResponse(
        UUID id,
        String eventType,
        String resourceType,
        UUID resourceId,
        String resourceLabel,
        UUID actorId,
        Map<String, Object> detailsJson,
        Instant createdAt
) {
    public static WebsiteAuditTimelineEventResponse from(WebsiteAuditTimelineEvent event) {
        return new WebsiteAuditTimelineEventResponse(
                event.getId(),
                event.getEventType(),
                event.getResourceType(),
                event.getResourceId(),
                event.getResourceLabel(),
                event.getActorId(),
                event.getDetailsJson(),
                event.getCreatedAt()
        );
    }
}
