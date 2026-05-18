package com.cloudcampus.experience.dto.request;

import java.util.List;
import java.util.Map;

public record StakeholderJourneyUpdateRequest(
        String name,
        String conversionGoal,
        Map<String, Object> narrativeJson,
        List<Object> touchpointsJson
) {}
