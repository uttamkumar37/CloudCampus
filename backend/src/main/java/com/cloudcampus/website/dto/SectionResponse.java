package com.cloudcampus.website.dto;

import com.cloudcampus.website.entity.WebsiteSection;

import java.util.Map;
import java.util.UUID;

public record SectionResponse(
        UUID                id,
        String              sectionType,
        int                 position,
        Map<String, Object> content,
        boolean             visible
) {
    public static SectionResponse from(WebsiteSection s) {
        return new SectionResponse(s.getId(), s.getSectionType(),
                s.getPosition(), s.getContent(), s.isVisible());
    }
}
