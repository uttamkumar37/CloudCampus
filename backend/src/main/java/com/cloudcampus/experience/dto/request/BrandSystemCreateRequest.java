package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record BrandSystemCreateRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) String code,
        Map<String, Object> tokenJson,
        Map<String, Object> typographyJson,
        Map<String, Object> motionJson
) {}
