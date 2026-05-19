package com.cloudcampus.staff.profile.dto;

import java.util.List;
import java.util.Map;

public record StaffProfileSectionResponse(
        String key,
        String title,
        String description,
        String visibility,
        boolean editable,
        int completionPercent,
        Map<String, Object> data,
        List<StaffTimelineItemResponse> timeline
) {}
