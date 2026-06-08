package com.cloudcampus.intelligence.ai;

import java.math.BigDecimal;
import java.time.Instant;

record AiRecommendationPortalResponse(
        String recommendationId,
        String tenantId,
        String schoolId,
        String targetType,
        String targetId,
        String recommendationType,
        String title,
        String summary,
        String rationale,
        BigDecimal confidenceScore,
        String riskLevel,
        String status,
        boolean approvalRequired,
        String metadataJson,
        Instant createdAt
) {
}

record AiRecommendationRejectRequest(String reason) {
}

record AiAutomationRulePortalResponse(
        String ruleId,
        String code,
        String name,
        String description,
        String triggerType,
        String actionType,
        boolean enabled,
        boolean requiresApproval,
        String approvalRole,
        String riskLevel
) {
}

record AiAutomationRunPortalResponse(
        String runId,
        String ruleId,
        String status,
        String triggeredByActorType,
        String inputSummaryJson,
        String outputSummaryJson,
        String errorMessage,
        Instant startedAt,
        Instant completedAt
) {
}
