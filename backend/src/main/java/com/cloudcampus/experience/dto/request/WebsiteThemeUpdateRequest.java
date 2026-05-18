package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record WebsiteThemeUpdateRequest(
        String name,
        Map<String, Object> tokensJson,
        Map<String, Object> typographyJson,
        Map<String, Object> effectsJson
) {
}
