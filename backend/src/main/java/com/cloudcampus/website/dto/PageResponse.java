package com.cloudcampus.website.dto;

import com.cloudcampus.website.entity.WebsitePage;

import java.time.Instant;
import java.util.UUID;

public record PageResponse(
        UUID    id,
        String  title,
        String  slug,
        String  seoTitle,
        String  seoDescription,
        boolean published,
        int     displayOrder,
        Instant updatedAt
) {
    public static PageResponse from(WebsitePage p) {
        return new PageResponse(p.getId(), p.getTitle(), p.getSlug(),
                p.getSeoTitle(), p.getSeoDescription(),
                p.isPublished(), p.getDisplayOrder(), p.getUpdatedAt());
    }
}
