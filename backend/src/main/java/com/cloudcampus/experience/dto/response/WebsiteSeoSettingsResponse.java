package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteSeoSettings;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsiteSeoSettingsResponse(
        UUID id,
        UUID pageId,
        String routePath,
        String metaTitle,
        String metaDescription,
        Map<String, Object> openGraphJson,
        Map<String, Object> twitterJson,
        Map<String, Object> structuredDataJson,
        String robots,
        double sitemapPriority,
        String sitemapChangeFreq,
        String status,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsiteSeoSettingsResponse from(WebsiteSeoSettings settings) {
        return new WebsiteSeoSettingsResponse(
                settings.getId(),
                settings.getPageId(),
                settings.getRoutePath(),
                settings.getMetaTitle(),
                settings.getMetaDescription(),
                settings.getOpenGraphJson(),
                settings.getTwitterJson(),
                settings.getStructuredDataJson(),
                settings.getRobots(),
                settings.getSitemapPriority(),
                settings.getSitemapChangeFreq(),
                settings.getStatus(),
                settings.isPublished(),
                settings.getPublishedAt(),
                settings.getUpdatedAt()
        );
    }
}
