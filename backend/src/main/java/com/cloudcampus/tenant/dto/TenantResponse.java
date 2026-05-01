package com.cloudcampus.tenant.dto;

import java.time.Instant;

public record TenantResponse(
        String tenantId,
        String slug,
        String schoolName,
        String schemaName,
        String logoUrl,
        String primaryColor,
        boolean active,
        Instant createdAt
) {
}
