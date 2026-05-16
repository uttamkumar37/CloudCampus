package com.cloudcampus.website.dto;

import com.cloudcampus.website.entity.WebsiteNavItem;

import java.util.UUID;

public record NavItemResponse(
        UUID   id,
        String label,
        String url,
        UUID   pageId,
        int    position,
        UUID   parentId
) {
    public static NavItemResponse from(WebsiteNavItem n) {
        return new NavItemResponse(n.getId(), n.getLabel(), n.getUrl(),
                n.getPageId(), n.getPosition(), n.getParentId());
    }
}
