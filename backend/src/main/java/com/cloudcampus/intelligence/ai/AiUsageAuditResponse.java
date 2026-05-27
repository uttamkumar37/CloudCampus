package com.cloudcampus.intelligence.ai;

import java.time.Instant;

public record AiUsageAuditResponse(
        String id,
        String tenantId,
        String schoolId,
        String userId,
        String role,
        AiFeature feature,
        AiScopeType scopeType,
        String scopeId,
        String requestType,
        String promptSha256,
        int promptLength,
        long estimatedInputUnits,
        long estimatedOutputUnits,
        long estimatedCostCents,
        AiUsageStatus status,
        String denialReason,
        Instant createdAt
) {
}
