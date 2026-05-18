package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record WebsiteTemplateResponse(
        UUID id,
        String templateKey,
        String name,
        String category,
        String status,
        String previewImageUrl,
        List<String> tags,
        Map<String, Object> schema,
        Map<String, Object> defaultBranding,
        long usageCount,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsiteTemplateResponse from(WebsiteTemplate template) {
        return new WebsiteTemplateResponse(
                template.getId(),
                template.getTemplateKey(),
                template.getName(),
                template.getCategory(),
                template.getStatus(),
                template.getPreviewImageUrl(),
                template.getTagsJson(),
                template.getSchemaJson(),
                template.getDefaultBrandingJson(),
                template.getUsageCount(),
                template.isPublished(),
                template.getPublishedAt(),
                template.getUpdatedAt()
        );
    }
}
