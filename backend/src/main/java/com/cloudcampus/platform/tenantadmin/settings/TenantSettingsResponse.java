package com.cloudcampus.platform.tenantadmin.settings;

import java.time.Instant;

public record TenantSettingsResponse(
        String tenantId,
        String tenantCode,
        String tenantName,
        String displayName,
        String billingEmail,
        String supportEmail,
        String timezone,
        String locale,
        Instant updatedAt
) {
}
