package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record TrustModuleUpdateRequest(
        @Size(max = 180) String title,
        @Size(max = 80) String category,
        Map<String, Object> evidenceJson,
        Map<String, Object> metricsJson,
        Map<String, Object> displayJson
) {}
