package com.cloudcampus.intelligence.ai;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AiEntitlementRequest(
        String tenantId,
        @NotNull Boolean enabled,
        @NotNull @Min(0) Long monthlyUnitBudget,
        @Size(max = 20) List<AiFeature> enabledFeatures,
        @NotNull Boolean humanApprovalRequired,
        @NotNull @Min(1) @Max(3650) Integer retentionDays
) {
}
