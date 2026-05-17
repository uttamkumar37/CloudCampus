package com.cloudcampus.feature.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.feature.entity.Feature;
import com.cloudcampus.feature.entity.FeatureType;
import com.cloudcampus.feature.entity.TenantFeature;
import com.cloudcampus.feature.entity.TenantFeatureId;
import com.cloudcampus.feature.repository.FeatureRepository;
import com.cloudcampus.feature.repository.TenantFeatureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Redis-backed feature flag service.
 *
 * Cache key:    {@code ff:{tenantId}}          → Redis Set of enabled feature keys
 * Cache TTL:    5 minutes (reset on every warm)
 * Invalidation: immediate on enable/disable
 *
 * CORE features are short-circuited before any cache or DB access.
 */
@Service
public class FeatureFlagServiceImpl implements FeatureFlagService {

    private static final Logger log = LoggerFactory.getLogger(FeatureFlagServiceImpl.class);

    /** Redis TTL for the feature flag cache per tenant. */
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    /** Redis key prefix. Full key: "ff:{tenantId}" */
    private static final String KEY_PREFIX = "ff:";

    private final FeatureRepository         featureRepository;
    private final TenantFeatureRepository   tenantFeatureRepository;
    private final RedisTemplate<String, String> redisTemplate;

    public FeatureFlagServiceImpl(
            FeatureRepository featureRepository,
            TenantFeatureRepository tenantFeatureRepository,
            RedisTemplate<String, String> redisTemplate) {
        this.featureRepository       = featureRepository;
        this.tenantFeatureRepository = tenantFeatureRepository;
        this.redisTemplate           = redisTemplate;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    @Override
    public boolean isEnabled(String tenantId, String featureKey) {
        if (tenantId == null || featureKey == null) {
            return false;
        }

        // CORE features are always enabled — no cache or DB access needed.
        Feature feature = featureRepository.findById(featureKey).orElse(null);
        if (feature != null && feature.getType() == FeatureType.CORE) {
            return true;
        }

        String cacheKey = KEY_PREFIX + tenantId;

        // Cache hit
        Boolean isMember = redisTemplate.opsForSet().isMember(cacheKey, featureKey);
        if (Boolean.TRUE.equals(isMember)) {
            return true;
        }

        // Cache miss — check if the key exists (the set may genuinely be empty)
        Boolean exists = redisTemplate.hasKey(cacheKey);
        if (Boolean.TRUE.equals(exists)) {
            // Cache is warm but feature not in set → disabled
            return false;
        }

        // Warm the cache from DB
        warmCache(UUID.fromString(tenantId), cacheKey);

        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(cacheKey, featureKey));
    }

    @Override
    @Transactional
    public void enable(UUID tenantId, String featureKey) {
        validateFeatureKey(featureKey);

        // Auto-enable required dependencies (skip CORE — they are always on).
        for (String dep : FeatureDependencies.getRequired(featureKey)) {
            Feature depFeature = featureRepository.findById(dep).orElse(null);
            if (depFeature != null && depFeature.getType() != FeatureType.CORE) {
                upsertEnabled(tenantId, dep, true);
                log.info("Feature auto-enabled (dependency): tenantId={}, feature={}", tenantId, dep);
            }
        }

        upsertEnabled(tenantId, featureKey, true);
        invalidateCache(tenantId);
        log.info("Feature enabled: tenantId={}, feature={}", tenantId, featureKey);
    }

    @Override
    @Transactional
    public void disable(UUID tenantId, String featureKey) {
        Feature feature = featureRepository.findById(featureKey)
                .orElseThrow(() -> new IllegalArgumentException("Unknown feature: " + featureKey));

        if (feature.getType() == FeatureType.CORE) {
            throw new IllegalArgumentException("CORE feature '" + featureKey + "' cannot be disabled");
        }

        // Block if any currently-enabled feature depends on this one.
        List<String> blockers = FeatureDependencies.getDependents(featureKey).stream()
                .filter(dep -> isEnabledInDb(tenantId, dep))
                .toList();
        if (!blockers.isEmpty()) {
            throw new BadRequestException(
                    "Cannot disable '" + featureKey + "' — required by: " +
                    String.join(", ", blockers) + ". Disable those features first.");
        }

        upsertEnabled(tenantId, featureKey, false);
        invalidateCache(tenantId);
        log.info("Feature disabled: tenantId={}, feature={}", tenantId, featureKey);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<String> getEnabledFeatures(UUID tenantId) {
        // Always include all CORE keys
        List<Feature> coreFeatures = featureRepository.findAllByType(FeatureType.CORE);
        Set<String> enabled = new HashSet<>();
        coreFeatures.forEach(f -> enabled.add(f.getKey()));

        // Add explicitly enabled non-CORE features from DB
        enabled.addAll(tenantFeatureRepository.findEnabledKeysByTenantId(tenantId));
        return enabled;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void warmCache(UUID tenantId, String cacheKey) {
        Set<String> enabled = getEnabledFeatures(tenantId);

        if (enabled.isEmpty()) {
            // Store a sentinel so we don't keep hitting the DB for tenants with no features
            redisTemplate.opsForSet().add(cacheKey, "__empty__");
        } else {
            redisTemplate.opsForSet().add(cacheKey, enabled.toArray(String[]::new));
        }
        redisTemplate.expire(cacheKey, CACHE_TTL);
        log.debug("Feature cache warmed: tenantId={}, keys={}", tenantId, enabled);
    }

    @Override
    public void invalidateForTenant(UUID tenantId) {
        invalidateCache(tenantId);
    }

    private void invalidateCache(UUID tenantId) {
        redisTemplate.delete(KEY_PREFIX + tenantId);
        log.debug("Feature cache invalidated: tenantId={}", tenantId);
    }

    private void upsertEnabled(UUID tenantId, String featureKey, boolean enabled) {
        TenantFeatureId id = new TenantFeatureId(tenantId, featureKey);
        TenantFeature tf = tenantFeatureRepository.findById(id)
                .orElseGet(() -> new TenantFeature(tenantId, featureKey, enabled));
        tf.setEnabled(enabled);
        tenantFeatureRepository.save(tf);
    }

    private void validateFeatureKey(String featureKey) {
        if (!featureRepository.existsById(featureKey)) {
            throw new IllegalArgumentException("Unknown feature: " + featureKey);
        }
    }

    private boolean isEnabledInDb(UUID tenantId, String featureKey) {
        return tenantFeatureRepository.findById(new TenantFeatureId(tenantId, featureKey))
                .map(TenantFeature::isEnabled)
                .orElse(false);
    }
}
