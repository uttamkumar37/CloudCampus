package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record WebsiteRouteCreateRequest(
        @NotBlank @Size(max = 500) String routePath,
        @NotBlank @Size(max = 80) String audienceType,
        @NotBlank @Size(max = 180) String title,
        Map<String, Object> seoJson,
        Map<String, Object> layoutJson,
        Map<String, Object> ctaJson
) {}
