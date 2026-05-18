package com.cloudcampus.experience.dto.request;

import java.util.List;
import java.util.Map;

public record StorySceneUpdateRequest(
        String title,
        String audienceType,
        Map<String, Object> timelineJson,
        List<Object> proofPointsJson,
        Map<String, Object> animationJson
) {}
