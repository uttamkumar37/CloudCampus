package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record WebsiteSectionCreateRequest(
        String sectionKey,
        String title,
        String sectionType,
        int position,
        Map<String, Object> configJson
) {
}
