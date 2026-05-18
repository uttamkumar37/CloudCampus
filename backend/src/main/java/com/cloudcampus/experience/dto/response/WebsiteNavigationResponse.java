package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.WebsiteNavigation;

import java.time.Instant;
import java.util.UUID;

public record WebsiteNavigationResponse(
        UUID id,
        String label,
        String path,
        String target,
        String groupName,
        int position,
        boolean visible,
        String status,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static WebsiteNavigationResponse from(WebsiteNavigation navigation) {
        return new WebsiteNavigationResponse(
                navigation.getId(),
                navigation.getLabel(),
                navigation.getPath(),
                navigation.getTarget(),
                navigation.getGroupName(),
                navigation.getPosition(),
                navigation.isVisible(),
                navigation.getStatus(),
                navigation.isPublished(),
                navigation.getPublishedAt(),
                navigation.getUpdatedAt()
        );
    }
}
