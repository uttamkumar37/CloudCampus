package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record WebsiteThemeCreateRequest(
        String themeKey,
        String name,
        Map<String, Object> tokensJson,
        Map<String, Object> typographyJson,
        Map<String, Object> effectsJson
) {
}
