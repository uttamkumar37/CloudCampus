package com.cloudcampus.feature.dto;

import com.cloudcampus.feature.entity.TenantFeature;

import java.time.Instant;
import java.util.UUID;

/**
 * Read-only view of a per-tenant feature flag state.
 */
public record TenantFeatureResponse(
        UUID    tenantId,
        String  featureKey,
        boolean enabled,
        Instant updatedAt
) {
    public static TenantFeatureResponse from(TenantFeature tf) {
        return new TenantFeatureResponse(
                tf.getTenantId(),
                tf.getFeatureKey(),
                tf.isEnabled(),
                tf.getUpdatedAt()
        );
    }
}
