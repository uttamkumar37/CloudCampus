package com.cloudcampus.feature.service;

import java.util.Set;
import java.util.UUID;

/**
 * Feature flag service — determines whether a feature is enabled for a given tenant.
 *
 * Cache contract: feature flags are cached in Redis under key {@code ff:{tenantId}}
 * as a set of enabled feature keys. TTL is 5 minutes. The cache is invalidated
 * immediately on every enable/disable operation so the next request re-warms it.
 *
 * CORE features are always considered enabled — they are NOT stored in Redis
 * and the service short-circuits without a cache or DB hit.
 */
public interface FeatureFlagService {

    /**
     * Returns true if the feature identified by {@code featureKey} is enabled
     * for the tenant identified by {@code tenantId}.
     *
     * CORE features always return true.
     * For all other types the result comes from the Redis cache (or DB on cache miss).
     *
     * @param tenantId   tenant UUID as a String (from RequestContext)
     * @param featureKey feature key, e.g. "ATTENDANCE_QR"
     */
    boolean isEnabled(String tenantId, String featureKey);

    /**
     * Enables a feature for a tenant. Creates a {@code tenant_features} row if absent.
     * Invalidates the Redis cache for this tenant.
     */
    void enable(UUID tenantId, String featureKey);

    /**
     * Disables a feature for a tenant. Creates a {@code tenant_features} row if absent.
     * Invalidates the Redis cache for this tenant.
     * CORE features cannot be disabled; throws {@link IllegalArgumentException}.
     */
    void disable(UUID tenantId, String featureKey);

    /**
     * Returns the full set of enabled feature keys for a tenant.
     * CORE features are always included.
     */
    Set<String> getEnabledFeatures(UUID tenantId);
}
