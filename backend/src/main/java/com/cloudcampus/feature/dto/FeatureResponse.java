package com.cloudcampus.feature.dto;

import com.cloudcampus.feature.entity.Feature;
import com.cloudcampus.feature.entity.FeatureType;

import java.time.Instant;

/**
 * Read-only view of a {@link Feature} catalog entry.
 */
public record FeatureResponse(
        String      key,
        String      name,
        FeatureType type,
        String      description,
        Instant     createdAt,
        Instant     updatedAt
) {
    public static FeatureResponse from(Feature f) {
        return new FeatureResponse(
                f.getKey(),
                f.getName(),
                f.getType(),
                f.getDescription(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}
