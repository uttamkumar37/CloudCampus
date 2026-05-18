package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record BrandSystemCreateRequest(
        String name,
        String code,
        Map<String, Object> tokenJson,
        Map<String, Object> typographyJson,
        Map<String, Object> motionJson
) {}
