package com.cloudcampus.experience.dto.response;

import java.util.Map;

public record PublicRenderProfileResponse(
        String audienceType,
        String routePath,
        String brandCode,
        Map<String, Object> brandTokens,
        Map<String, Object> typography,
        Map<String, Object> motion,
        Map<String, Object> seo,
        Map<String, Object> layout,
        Map<String, Object> cta,
        String journeyKey,
        String conversionGoal,
        Map<String, Object> narrative,
        Object touchpoints
) {}
