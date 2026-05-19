package com.cloudcampus.student.profile.dto;

import java.util.List;
import java.util.Map;

public record ProfileSectionResponse(
        String key,
        String title,
        String description,
        String visibility,
        boolean editable,
        int completionPercent,
        Map<String, Object> data,
        List<TimelineItemResponse> timeline
) {}
