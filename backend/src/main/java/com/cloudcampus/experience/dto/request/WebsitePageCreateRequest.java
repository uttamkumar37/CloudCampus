package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record WebsitePageCreateRequest(
        String pageKey,
        String title,
        String slug,
        Map<String, Object> seoJson,
        Map<String, Object> settingsJson
) {
}
