package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record TrustModuleCreateRequest(
        @NotBlank @Size(max = 120) String moduleKey,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 80) String category,
        Map<String, Object> evidenceJson,
        Map<String, Object> metricsJson,
        Map<String, Object> displayJson
) {}
