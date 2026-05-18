package com.cloudcampus.experience.dto.request;

import java.util.Map;
import java.util.UUID;

public record ContentBlockCreateRequest(
        UUID tenantId,
        String blockKey,
        String blockType,
        Map<String, Object> content,
        String locale
) {}
