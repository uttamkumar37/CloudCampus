package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record WebsiteThemeUpdateRequest(
        @Size(max = 180) String name,
        Map<String, Object> tokensJson,
        Map<String, Object> typographyJson,
        Map<String, Object> effectsJson
) {
}
