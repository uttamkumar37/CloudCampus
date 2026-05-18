package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteRouteConfig;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsiteRouteResponse(
        UUID id,
        String routePath,
        String audienceType,
        String title,
        String status,
        Map<String, Object> seoJson,
        Map<String, Object> layoutJson,
        Map<String, Object> ctaJson,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsiteRouteResponse from(WebsiteRouteConfig r) {
        return new WebsiteRouteResponse(
                r.getId(),
                r.getRoutePath(),
                r.getAudienceType(),
                r.getTitle(),
                r.getStatus(),
                r.getSeoJson(),
                r.getLayoutJson(),
                r.getCtaJson(),
                r.isPublished(),
                r.getPublishedAt(),
                r.getUpdatedAt()
        );
    }
}
