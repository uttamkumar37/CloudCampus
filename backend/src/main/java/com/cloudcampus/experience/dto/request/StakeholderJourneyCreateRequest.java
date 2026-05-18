package com.cloudcampus.experience.dto.request;

import java.util.List;
import java.util.Map;

public record StakeholderJourneyCreateRequest(
        String stakeholderType,
        String journeyKey,
        String name,
        String conversionGoal,
        Map<String, Object> narrativeJson,
        List<Object> touchpointsJson
) {}
