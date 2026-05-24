package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record WebsiteRouteUpdateRequest(
        @Size(max = 80) String audienceType,
        @Size(max = 180) String title,
        Map<String, Object> seoJson,
        Map<String, Object> layoutJson,
        Map<String, Object> ctaJson
) {}
