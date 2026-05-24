package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record BrandSystemUpdateRequest(
        @Size(max = 160) String name,
        Map<String, Object> tokenJson,
        Map<String, Object> typographyJson,
        Map<String, Object> motionJson
) {}
