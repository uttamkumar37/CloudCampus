package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record WebsiteRouteUpdateRequest(
        String audienceType,
        String title,
        Map<String, Object> seoJson,
        Map<String, Object> layoutJson,
        Map<String, Object> ctaJson
) {}
