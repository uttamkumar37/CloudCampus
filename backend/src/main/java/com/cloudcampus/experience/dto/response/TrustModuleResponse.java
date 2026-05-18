package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.TrustModule;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record TrustModuleResponse(
        UUID id,
        String moduleKey,
        String title,
        String category,
        String status,
        Map<String, Object> evidence,
        Map<String, Object> metrics,
        Map<String, Object> display,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static TrustModuleResponse from(TrustModule module) {
        return new TrustModuleResponse(
                module.getId(),
                module.getModuleKey(),
                module.getTitle(),
                module.getCategory(),
                module.getStatus(),
                module.getEvidenceJson(),
                module.getMetricsJson(),
                module.getDisplayJson(),
                module.isPublished(),
                module.getPublishedAt(),
                module.getUpdatedAt()
        );
    }
}
