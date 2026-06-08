package com.cloudcampus.platform.superadmin.control;

public record TenantAggregateCount(
        String tenantId,
        long totalCount,
        long activeCount
) {
}
