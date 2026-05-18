package com.cloudcampus.experience.dto.request;

import java.util.List;
import java.util.Map;

public record WebsiteTemplateCreateRequest(
        String templateKey,
        String name,
        String category,
        String previewImageUrl,
        List<String> tags,
        Map<String, Object> schemaJson,
        Map<String, Object> defaultBrandingJson
) {}
