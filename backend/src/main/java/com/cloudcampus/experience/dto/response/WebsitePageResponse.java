package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsitePage;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsitePageResponse(
        UUID id,
        String pageKey,
        String title,
        String slug,
        String status,
        Map<String, Object> seoJson,
        Map<String, Object> settingsJson,
        int version,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsitePageResponse from(WebsitePage page) {
        return new WebsitePageResponse(
                page.getId(),
                page.getPageKey(),
                page.getTitle(),
                page.getSlug(),
                page.getStatus(),
                page.getSeoJson(),
                page.getSettingsJson(),
                page.getVersion(),
                page.isPublished(),
                page.getPublishedAt(),
                page.getUpdatedAt()
        );
    }
}
