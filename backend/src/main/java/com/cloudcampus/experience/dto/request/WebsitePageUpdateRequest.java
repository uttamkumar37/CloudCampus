package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record WebsitePageUpdateRequest(
        @Size(max = 180) String title,
        @Size(max = 180) String slug,
        Map<String, Object> seoJson,
        Map<String, Object> settingsJson
) {
}
