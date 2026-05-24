package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record StakeholderJourneyUpdateRequest(
        @Size(max = 180) String name,
        @Size(max = 180) String conversionGoal,
        Map<String, Object> narrativeJson,
        @Size(max = 100) List<Object> touchpointsJson
) {}
