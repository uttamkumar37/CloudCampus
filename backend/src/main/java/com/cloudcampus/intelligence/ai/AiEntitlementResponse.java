package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.List;

public record AiEntitlementResponse(
        String tenantId,
        boolean enabled,
        long monthlyUnitBudget,
        long unitsUsedThisMonth,
        long remainingUnitsThisMonth,
        List<AiFeature> enabledFeatures,
        boolean humanApprovalRequired,
        int retentionDays,
        String updatedByUserId,
        Instant updatedAt
) {
}
