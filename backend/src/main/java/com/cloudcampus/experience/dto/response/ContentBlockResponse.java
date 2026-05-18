package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.ContentBlock;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ContentBlockResponse(
        UUID id,
        String blockKey,
        String blockType,
        Map<String, Object> content,
        String locale,
        int version,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static ContentBlockResponse from(ContentBlock b) {
        return new ContentBlockResponse(
                b.getId(), b.getBlockKey(), b.getBlockType(),
                b.getContentJson(), b.getLocale(), b.getVersion(),
                b.isPublished(), b.getPublishedAt(), b.getUpdatedAt()
        );
    }
}
