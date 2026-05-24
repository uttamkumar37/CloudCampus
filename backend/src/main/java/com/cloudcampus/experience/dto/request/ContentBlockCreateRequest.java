package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.UUID;

public record ContentBlockCreateRequest(
        UUID tenantId,
        @NotBlank @Size(max = 120) String blockKey,
        @NotBlank @Size(max = 80) String blockType,
        Map<String, Object> content,
        @Size(max = 16) String locale
) {}
