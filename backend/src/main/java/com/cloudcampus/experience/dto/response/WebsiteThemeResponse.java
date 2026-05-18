package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteTheme;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record WebsiteThemeResponse(
        UUID id,
        String themeKey,
        String name,
        String status,
        Map<String, Object> tokensJson,
        Map<String, Object> typographyJson,
        Map<String, Object> effectsJson,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsiteThemeResponse from(WebsiteTheme theme) {
        return new WebsiteThemeResponse(
                theme.getId(),
                theme.getThemeKey(),
                theme.getName(),
                theme.getStatus(),
                theme.getTokensJson(),
                theme.getTypographyJson(),
                theme.getEffectsJson(),
                theme.isPublished(),
                theme.getPublishedAt(),
                theme.getUpdatedAt()
        );
    }
}
