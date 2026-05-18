package com.cloudcampus.experience.dto.response;

import com.cloudcampus.experience.entity.BrandSystem;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record BrandSystemResponse(
        UUID id,
        String name,
        String code,
        String status,
        Map<String, Object> tokenJson,
        Map<String, Object> typographyJson,
        Map<String, Object> motionJson,
        int version,
        boolean published,
        Instant publishedAt,
        Instant updatedAt
) {
    public static BrandSystemResponse from(BrandSystem b) {
        return new BrandSystemResponse(
                b.getId(),
                b.getName(),
                b.getCode(),
                b.getStatus(),
                b.getTokenJson(),
                b.getTypographyJson(),
                b.getMotionJson(),
                b.getVersion(),
                b.isPublished(),
                b.getPublishedAt(),
                b.getUpdatedAt()
        );
    }
}
