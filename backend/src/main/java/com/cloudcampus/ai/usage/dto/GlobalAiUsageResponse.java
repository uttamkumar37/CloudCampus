package com.cloudcampus.ai.usage.dto;

import java.time.Instant;
import java.util.List;

public record GlobalAiUsageResponse(
        Instant              periodStart,
        long                 totalTokensThisMonth,
        long                 totalRequestsThisMonth,
        List<TenantAiUsage>  byTenant
) {
    public record TenantAiUsage(String tenantId, long tokens, long requests) {}
}
