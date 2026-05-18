package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record TrustModuleCreateRequest(
        String moduleKey,
        String title,
        String category,
        Map<String, Object> evidenceJson,
        Map<String, Object> metricsJson,
        Map<String, Object> displayJson
) {}
