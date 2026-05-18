package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteSection;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsiteSectionResponse(
        UUID id,
        UUID pageId,
        String sectionKey,
        String title,
        String sectionType,
        int position,
        Map<String, Object> configJson,
        String status,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsiteSectionResponse from(WebsiteSection section) {
        return new WebsiteSectionResponse(
                section.getId(),
                section.getPageId(),
                section.getSectionKey(),
                section.getTitle(),
                section.getSectionType(),
                section.getPosition(),
                section.getConfigJson(),
                section.getStatus(),
                section.isPublished(),
                section.getPublishedAt(),
                section.getUpdatedAt()
        );
    }
}
