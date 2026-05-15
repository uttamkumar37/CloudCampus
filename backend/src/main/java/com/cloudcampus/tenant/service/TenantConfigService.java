package com.cloudcampus.tenant.service;

import com.cloudcampus.tenant.dto.TenantConfigResponse;
import com.cloudcampus.tenant.entity.TenantConfigKey;

import java.util.UUID;

public interface TenantConfigService {

    /**
     * Returns all config keys with their current values.
     * Keys not explicitly set for this tenant fall back to their default.
     */
    TenantConfigResponse getAll(UUID tenantId);

    /**
     * Upserts a single config value for the tenant.
     * Validates that the key is known and the value passes per-key rules.
     *
     * @return the updated full config (same shape as getAll)
     * @throws com.cloudcampus.common.exception.BadRequestException on invalid value
     * @throws com.cloudcampus.common.exception.NotFoundException   if the tenant doesn't exist
     */
    TenantConfigResponse set(UUID tenantId, TenantConfigKey key, String value);
}
