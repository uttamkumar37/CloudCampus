package com.cloudcampus.tenant.dto;

import com.cloudcampus.tenant.entity.TenantConfigKey;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Response envelope for GET /v1/super-admin/tenants/{id}/config.
 *
 * Returns all known keys with their current value (explicit override or default).
 * Each entry also carries the key description and the default value so the UI
 * can show helpful tooltips without a second round-trip.
 */
public record TenantConfigResponse(
        Map<String, ConfigEntry> config
) {
    public record ConfigEntry(
            String value,
            String defaultValue,
            String description
    ) {}

    public static TenantConfigResponse from(Map<TenantConfigKey, String> values) {
        Map<String, ConfigEntry> out = new LinkedHashMap<>();
        for (TenantConfigKey key : TenantConfigKey.values()) {
            String value = values.getOrDefault(key, key.getDefaultValue());
            out.put(key.name(), new ConfigEntry(value, key.getDefaultValue(), key.getDescription()));
        }
        return new TenantConfigResponse(out);
    }
}
