package com.cloudcampus.intelligence.ai;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AiUsageAuditRequest(
        String tenantId,
        String schoolId,
        @NotNull AiFeature feature,
        @NotNull AiScopeType scopeType,
        @Size(max = 80) String scopeId,
        @NotBlank @Size(max = 80) String requestType,
        @NotBlank @Size(max = 8000) String promptText,
        @Min(0) long estimatedInputUnits,
        @Min(0) long estimatedOutputUnits,
        @Min(0) long estimatedCostCents
) {
}
