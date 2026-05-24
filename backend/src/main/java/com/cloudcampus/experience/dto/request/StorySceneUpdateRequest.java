package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record StorySceneUpdateRequest(
        @Size(max = 180) String title,
        @Size(max = 80) String audienceType,
        Map<String, Object> timelineJson,
        @Size(max = 100) List<Object> proofPointsJson,
        Map<String, Object> animationJson
) {}
