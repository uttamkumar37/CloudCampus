package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record BrandSystemUpdateRequest(
        String name,
        Map<String, Object> tokenJson,
        Map<String, Object> typographyJson,
        Map<String, Object> motionJson
) {}
