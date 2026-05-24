package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record WebsiteTemplateCreateRequest(
        @NotBlank @Size(max = 120) String templateKey,
        @NotBlank @Size(max = 180) String name,
        @NotBlank @Size(max = 80) String category,
        @Size(max = 2048) String previewImageUrl,
        @Size(max = 50) List<@Size(max = 60) String> tags,
        Map<String, Object> schemaJson,
        Map<String, Object> defaultBrandingJson
) {}
