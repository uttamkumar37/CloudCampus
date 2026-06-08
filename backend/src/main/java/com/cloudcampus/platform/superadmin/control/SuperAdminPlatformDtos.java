package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.cloudcampus.platform.tenant.TenantStatus;

record SuperAdminPageResponse<T>(
        List<T> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}

record SuperAdminMetricResponse(
        String label,
        String value,
        String detail
) {
}

record SuperAdminDashboardResponse(
        List<SuperAdminMetricResponse> metrics,
        List<SuperAdminTrendPointResponse> revenueTrend,
        List<SuperAdminTrendPointResponse> tenantGrowthTrend,
        List<SuperAdminTrendPointResponse> schoolGrowthTrend,
        List<SuperAdminTenantResponse> recentOnboardings,
        List<SuperAdminInvoiceResponse> pendingInvoices,
        List<SuperAdminAlertResponse> platformAlerts
) {
}

record SuperAdminPlatformMetricsResponse(
        long totalTenantCount,
        long activeTenantCount,
        long totalSchoolCount,
        long activeSchoolCount,
        long totalStudentCount,
        long activeStudentCount,
        long totalStaffCount,
        long activeStaffCount,
        long totalUserCount,
        long activeUserCount,
        long pendingInvoiceCount,
        long overdueInvoiceCount,
        long paidInvoiceCount,
        long failedNotificationCount,
        long pendingOutboxCount,
        long pendingReportExportCount,
        Instant lastCalculatedAt
) {
}

record SuperAdminTrendPointResponse(
        String label,
        long value
) {
}

record SuperAdminAlertResponse(
        String title,
        String detail,
        String severity,
        Instant createdAt
) {
}

record SuperAdminTenantResponse(
        String tenantId,
        String code,
        String name,
        String status,
        long schoolCount,
        long activeSchoolCount,
        long userCount,
        String planCode,
        String planName,
        Instant createdAt
) {
}

record TenantStatusUpdateRequest(TenantStatus status) {
}

record TenantSettingsUpdateRequest(String name) {
}

record SuperAdminSchoolResponse(
        String schoolId,
        String schoolCode,
        String schoolName,
        String tenantId,
        String tenantCode,
        String tenantName,
        String status,
        boolean primarySchool,
        long studentCount,
        long staffCount,
        Instant createdAt,
        Instant lastActivityAt
) {
}

record SuperAdminUserResponse(
        String userId,
        String email,
        String displayName,
        String role,
        String status,
        Instant activatedAt
) {
}

record SuperAdminInvoiceResponse(
        String invoiceId,
        String invoiceNumber,
        String tenantId,
        String tenantName,
        String planCode,
        String billingCycle,
        long amountCents,
        String currency,
        String status,
        Instant issuedAt,
        Instant dueAt
) {
}

record SuperAdminRevenueSummaryResponse(
        long monthlyRecurringRevenueCents,
        long annualRecurringRevenueEstimateCents,
        long totalInvoicedCents,
        long issuedInvoiceCount,
        long paidInvoiceCount,
        long pendingInvoiceCount,
        long overdueInvoiceCount,
        List<SuperAdminTrendPointResponse> monthlyTrend,
        List<SuperAdminRevenueBreakdownResponse> tenantBreakdown,
        List<SuperAdminRevenueBreakdownResponse> planBreakdown
) {
}

record SuperAdminRevenueBreakdownResponse(
        String id,
        String label,
        long amountCents,
        long invoiceCount
) {
}

record SuperAdminAiUsageSummaryResponse(
        long enabledTenantCount,
        long totalMonthlyBudget,
        long totalUnitsUsedThisMonth,
        long deniedRequestsThisMonth,
        long budgetExceededRequestsThisMonth,
        List<SuperAdminAiTenantUsageResponse> tenants,
        List<SuperAdminAiAuditResponse> usageAudit
) {
}

record SuperAdminAiTenantUsageResponse(
        String tenantId,
        String tenantName,
        boolean enabled,
        long monthlyUnitBudget,
        long unitsUsedThisMonth,
        long remainingUnitsThisMonth,
        boolean humanApprovalRequired,
        List<String> enabledFeatures,
        Instant updatedAt
) {
}

record SuperAdminAiAuditResponse(
        String auditId,
        String tenantId,
        String tenantName,
        String userRole,
        String feature,
        String status,
        long estimatedUnits,
        long estimatedCostCents,
        String denialReason,
        Instant createdAt
) {
}

record SuperAdminReportsSummaryResponse(
        List<SuperAdminMetricResponse> metrics,
        List<SuperAdminReportExportResponse> exports
) {
}

record SuperAdminReportExportResponse(
        String exportId,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String reportType,
        String format,
        String status,
        Instant requestedAt,
        Instant completedAt
) {
}

record SuperAdminReportExportRequest(String reportType, String format, String tenantId, String schoolId, Map<String, Object> filters) {
}

record SuperAdminAuditLogResponse(
        String auditLogId,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String actorType,
        String actorId,
        String action,
        String entityType,
        String entityId,
        String summary,
        String metadataJson,
        Instant createdAt
) {
}

record SuperAdminPlatformHealthResponse(
        String backendHealth,
        String readiness,
        String databaseStatus,
        String migrationStatus,
        String notificationMode,
        long pendingOutboxCount,
        long pendingReportExportCount,
        long aiEnabledTenantCount,
        String appVersion,
        Instant checkedAt,
        List<SuperAdminAlertResponse> alerts
) {
}

record SuperAdminNotificationSummaryResponse(
        long totalDeliveries,
        long sentDeliveries,
        long loggedDeliveries,
        long failedDeliveries,
        long disabledDeliveries,
        List<SuperAdminNotificationDeliveryResponse> recentDeliveries
) {
}

record SuperAdminNotificationDeliveryResponse(
        String deliveryId,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String channel,
        String template,
        String recipientRole,
        String maskedRecipient,
        String subject,
        String status,
        String provider,
        String failureReason,
        Instant createdAt,
        Instant sentAt,
        Instant failedAt
) {
}

record SuperAdminSettingsResponse(
        String platformName,
        String supportEmail,
        String defaultTimezone,
        String publicFrontendUrl,
        List<String> corsAllowedOrigins,
        String notificationMode,
        String aiDefaultPolicy,
        boolean maintenanceMode,
        Map<String, String> runtime
) {
}

record SuperAdminSettingsUpdateRequest(
        String platformName,
        String supportEmail,
        String defaultTimezone,
        boolean maintenanceMode
) {
}

record SuperAdminSearchResponse(
        List<SuperAdminSearchResultResponse> results,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}

record SuperAdminSearchResultResponse(
        String id,
        String type,
        String title,
        String detail,
        String navId,
        Instant createdAt
) {
}
