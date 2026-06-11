package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record AiAssistantQueryRequest(
        @NotBlank @Size(max = 8000) String prompt,
        @Size(max = 80) String module,
        @Size(max = 40) String tone,
        @Size(max = 40) String language
) {
}

record AiNoticeGenerationRequest(
        @NotBlank @Size(max = 180) String topic,
        @Size(max = 80) String audience,
        @Size(max = 40) String channel,
        @Size(max = 40) String tone,
        @Size(max = 40) String language,
        @Size(max = 3000) String details
) {
}

record AiLessonPlanGenerationRequest(
        @NotBlank @Size(max = 80) String className,
        @Size(max = 80) String section,
        @NotBlank @Size(max = 120) String subject,
        @NotBlank @Size(max = 180) String chapter,
        @Size(max = 60) String difficulty,
        @Size(max = 80) String boardType,
        @Size(max = 40) String studentLevel,
        @Min(10) @Max(180) Integer durationMinutes,
        @Size(max = 3000) String instructions
) {
}

record AiHomeworkGenerationRequest(
        @NotBlank @Size(max = 80) String className,
        @Size(max = 80) String section,
        @NotBlank @Size(max = 120) String subject,
        @NotBlank @Size(max = 180) String chapter,
        @Size(max = 60) String difficulty,
        @Size(max = 40) String studentLevel,
        @Size(max = 3000) String instructions
) {
}

record AiQuizGenerationRequest(
        @NotBlank @Size(max = 80) String className,
        @Size(max = 80) String section,
        @NotBlank @Size(max = 120) String subject,
        @NotBlank @Size(max = 180) String chapter,
        @Size(max = 60) String difficulty,
        @Min(1) @Max(50) Integer questionCount,
        @Size(max = 3000) String instructions
) {
}

record AiReportSummaryRequest(
        @NotBlank @Size(max = 120) String reportType,
        @Size(max = 120) String reportScope,
        @NotBlank @Size(max = 8000) String reportText,
        @Size(max = 40) String tone,
        @Size(max = 40) String language
) {
}

record AiAssistantResponse(
        String feature,
        String role,
        String tenantId,
        String schoolId,
        String answer,
        List<String> highlights,
        List<String> recommendedActions,
        List<AiQuickActionResponse> quickActions,
        String disclaimer,
        String usageAuditId,
        String provider,
        String model
) {
}

record AiQuickActionResponse(
        String label,
        String prompt,
        String endpoint
) {
}

record AiPortalSettingsResponse(
        String tenantId,
        String schoolId,
        boolean enabled,
        long monthlyUnitBudget,
        long unitsUsedThisMonth,
        long remainingUnitsThisMonth,
        List<String> enabledFeatures,
        boolean humanApprovalRequired,
        int retentionDays,
        List<AiRoleCapabilityResponse> capabilities
) {
}

record AiRoleCapabilityResponse(
        String role,
        List<String> features,
        List<AiQuickActionResponse> quickActions
) {
}

record AiPortalAuditLogResponse(
        String id,
        String tenantId,
        String schoolId,
        String userId,
        String role,
        String feature,
        String scopeType,
        String scopeId,
        String requestType,
        String promptSha256,
        int promptLength,
        long estimatedUnits,
        long estimatedCostCents,
        String status,
        String denialReason,
        Instant createdAt
) {
}
