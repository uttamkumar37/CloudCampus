package com.cloudcampus.feature.dto;

import com.cloudcampus.feature.entity.Feature;
import com.cloudcampus.feature.entity.FeatureType;
import com.cloudcampus.feature.service.FeatureDependencies;

import java.time.Instant;
import java.util.List;

/**
 * Read-only view of a {@link Feature} catalog entry.
 * Includes the dependency list so clients can render the dependency graph.
 */
public record FeatureResponse(
        String      key,
        String      name,
        FeatureType type,
        String      description,
        List<String> dependencies,
        Instant     createdAt,
        Instant     updatedAt
) {
    public static FeatureResponse from(Feature f) {
        return new FeatureResponse(
                f.getKey(),
                f.getName(),
                f.getType(),
                f.getDescription(),
                FeatureDependencies.getRequired(f.getKey()),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}
