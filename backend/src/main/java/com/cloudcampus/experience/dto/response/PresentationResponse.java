package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.Presentation;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record PresentationResponse(
        UUID id,
        String title,
        String slug,
        String audienceType,
        String status,
        Map<String, Object> meta,
        Map<String, Object> branding,
        Instant createdAt,
        Instant updatedAt
) {
    public static PresentationResponse from(Presentation p) {
        return new PresentationResponse(
                p.getId(), p.getTitle(), p.getSlug(), p.getAudienceType(),
                p.getStatus(), p.getMetaJson(), p.getBrandingJson(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
