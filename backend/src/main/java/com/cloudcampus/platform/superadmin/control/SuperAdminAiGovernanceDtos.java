package com.cloudcampus.platform.superadmin.control;

import java.math.BigDecimal;
import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.intelligence.ai.AiRecommendationRiskLevel;
import com.cloudcampus.intelligence.ai.AiRecommendationStatus;
import com.cloudcampus.intelligence.ai.AiRecommendationType;

record SuperAdminAiRecommendationResponse(
        String recommendationId,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String targetType,
        String targetId,
        String recommendationType,
        String title,
        String summary,
        String rationale,
        BigDecimal confidenceScore,
        String riskLevel,
        String status,
        String createdByActorType,
        String createdByActorId,
        String assignedToUserId,
        String assignedToName,
        boolean approvalRequired,
        String approvedBy,
        Instant approvedAt,
        String rejectedBy,
        Instant rejectedAt,
        String rejectionReason,
        Instant executedAt,
        String failureReason,
        Instant expiresAt,
        String sourceUsageAuditId,
        String metadataJson,
        Instant createdAt
) {
}

record AiRecommendationCreateRequest(
        String tenantId,
        String schoolId,
        String targetType,
        String targetId,
        AiRecommendationType recommendationType,
        String title,
        String summary,
        String rationale,
        BigDecimal confidenceScore,
        AiRecommendationRiskLevel riskLevel,
        AiRecommendationStatus status,
        String createdByActorType,
        String createdByActorId,
        String assignedToUserId,
        Boolean approvalRequired,
        Instant expiresAt,
        String sourceUsageAuditId,
        String metadataJson
) {
}

record AiRecommendationDecisionRequest(String reason) {
}

record SuperAdminAutomationRuleResponse(
        String ruleId,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String code,
        String name,
        String description,
        String triggerType,
        String actionType,
        boolean enabled,
        boolean requiresApproval,
        String approvalRole,
        String riskLevel,
        Instant createdAt
) {
}

record AutomationRuleRequest(
        String tenantId,
        String schoolId,
        String code,
        String name,
        String description,
        String triggerType,
        String triggerConfigJson,
        String actionType,
        String actionConfigJson,
        Boolean enabled,
        Boolean requiresApproval,
        UserRole approvalRole,
        AiRecommendationRiskLevel riskLevel
) {
}

record AutomationRuleUpdateRequest(
        String name,
        String description,
        Boolean enabled,
        Boolean requiresApproval,
        UserRole approvalRole,
        AiRecommendationRiskLevel riskLevel
) {
}

record SuperAdminAutomationRunResponse(
        String runId,
        String ruleId,
        String ruleName,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String status,
        String triggeredByActorType,
        String inputSummaryJson,
        String outputSummaryJson,
        String errorMessage,
        Instant startedAt,
        Instant completedAt
) {
}

record SuperAdminAiPolicyResponse(
        String policyId,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        boolean enabled,
        String allowedFeaturesJson,
        long monthlyBudgetUnits,
        boolean humanApprovalRequiredDefault,
        boolean allowLowRiskAutoPublish,
        boolean allowFeeReminderAutoSend,
        boolean allowParentMessageAutoSend,
        int retentionDays,
        Instant updatedAt
) {
}

record AiPolicyUpdateRequest(
        String schoolId,
        Boolean enabled,
        String allowedFeaturesJson,
        Long monthlyBudgetUnits,
        Boolean humanApprovalRequiredDefault,
        Boolean allowLowRiskAutoPublish,
        Boolean allowFeeReminderAutoSend,
        Boolean allowParentMessageAutoSend,
        Integer retentionDays
) {
}
