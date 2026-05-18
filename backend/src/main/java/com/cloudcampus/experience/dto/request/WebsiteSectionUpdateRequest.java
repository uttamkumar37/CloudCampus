package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record WebsiteSectionUpdateRequest(
        String title,
        String sectionType,
        int position,
        Map<String, Object> configJson
) {
}
