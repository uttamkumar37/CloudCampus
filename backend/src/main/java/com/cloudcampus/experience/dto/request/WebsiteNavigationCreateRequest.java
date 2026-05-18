package com.cloudcampus.experience.dto.request;

public record WebsiteNavigationCreateRequest(
        String label,
        String path,
        String target,
        String groupName,
        int position,
        boolean visible
) {
}
