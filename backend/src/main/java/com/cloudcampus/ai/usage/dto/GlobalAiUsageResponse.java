package com.cloudcampus.ai.usage.dto;

import java.time.Instant;
import java.util.List;

public record GlobalAiUsageResponse(
        Instant              periodStart,
        long                 totalTokensThisMonth,
        long                 totalRequestsThisMonth,
        double               estimatedCostUsd,
        List<TenantAiUsage>  byTenant,
        List<FeatureAiUsage> byFeature,
        List<ModelAiUsage>   byModel,
        List<AiUsageAnomaly> anomalies
) {
    public record TenantAiUsage(
            String tenantId,
            long tokens,
            long requests,
            long failedRequests,
            double estimatedCostUsd,
            Integer budgetUtilisationPct
    ) {}

    public record FeatureAiUsage(
            String feature,
            long tokens,
            long requests,
            long failedRequests,
            double estimatedCostUsd
    ) {}

    public record ModelAiUsage(
            String provider,
            String model,
            long tokens,
            long requests,
            long failedRequests,
            long avgLatencyMs,
            double estimatedCostUsd
    ) {}

    public record AiUsageAnomaly(
            String severity,
            String tenantId,
            String scope,
            String signal,
            String detail,
            long tokens,
            long requests
    ) {}
}
