package com.cloudcampus.platform.superadmin.control;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin")
public class SuperAdminPlatformController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final SuperAdminPlatformService superAdminPlatformService;

    public SuperAdminPlatformController(
            AuthenticatedUserResolver authenticatedUserResolver,
            SuperAdminPlatformService superAdminPlatformService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.superAdminPlatformService = superAdminPlatformService;
    }

    @GetMapping("/tenants")
    ResponseEntity<SuperAdminPageResponse<SuperAdminTenantResponse>> tenants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.tenants(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                search,
                status
        ));
    }

    @GetMapping("/tenants/{tenantId}")
    ResponseEntity<SuperAdminTenantResponse> tenant(
            @PathVariable String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.tenant(authenticatedUserResolver.requireUser(request), tenantId));
    }

    @PatchMapping("/tenants/{tenantId}/status")
    ResponseEntity<SuperAdminTenantResponse> updateTenantStatus(
            @PathVariable String tenantId,
            @Valid @RequestBody TenantStatusUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.updateTenantStatus(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                requestBody
        ));
    }

    @PatchMapping("/tenants/{tenantId}/settings")
    ResponseEntity<SuperAdminTenantResponse> updateTenantSettings(
            @PathVariable String tenantId,
            @Valid @RequestBody TenantSettingsUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.updateTenantSettings(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                requestBody
        ));
    }

    @GetMapping("/tenants/{tenantId}/schools")
    ResponseEntity<SuperAdminPageResponse<SuperAdminSchoolResponse>> tenantSchools(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.schoolsForTenant(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                page,
                size
        ));
    }

    @GetMapping("/tenants/{tenantId}/users")
    ResponseEntity<SuperAdminPageResponse<SuperAdminUserResponse>> tenantUsers(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.usersForTenant(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                page,
                size
        ));
    }

    @GetMapping("/tenants/{tenantId}/audit")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAuditLogResponse>> tenantAudit(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.auditForTenant(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                page,
                size
        ));
    }

    @GetMapping("/schools")
    ResponseEntity<SuperAdminPageResponse<SuperAdminSchoolResponse>> schools(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String status,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.schools(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                search,
                tenantId,
                status
        ));
    }

    @GetMapping("/schools/{schoolId}")
    ResponseEntity<SuperAdminSchoolResponse> school(
            @PathVariable String schoolId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.school(authenticatedUserResolver.requireUser(request), schoolId));
    }

    @GetMapping("/platform-metrics")
    ResponseEntity<SuperAdminPlatformMetricsResponse> platformMetrics(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.platformMetrics(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/revenue/summary")
    ResponseEntity<SuperAdminRevenueSummaryResponse> revenueSummary(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.revenueSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/revenue/invoices")
    ResponseEntity<SuperAdminPageResponse<SuperAdminInvoiceResponse>> invoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.invoices(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                status,
                tenantId,
                from,
                to
        ));
    }

    @GetMapping("/revenue/trends")
    ResponseEntity<SuperAdminRevenueSummaryResponse> revenueTrends(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.revenueSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/revenue/tenants")
    ResponseEntity<SuperAdminRevenueSummaryResponse> tenantRevenue(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.revenueSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/ai/usage/summary")
    ResponseEntity<SuperAdminAiUsageSummaryResponse> aiUsageSummary(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.aiUsageSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/ai/usage/tenants")
    ResponseEntity<java.util.List<SuperAdminAiTenantUsageResponse>> aiTenantUsage(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.aiTenantUsage(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/ai/entitlements")
    ResponseEntity<java.util.List<SuperAdminAiTenantUsageResponse>> aiEntitlements(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.aiTenantUsage(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/reports/summary")
    ResponseEntity<SuperAdminReportsSummaryResponse> reportsSummary(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.reportsSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/reports/tenants")
    ResponseEntity<SuperAdminPageResponse<SuperAdminTenantResponse>> tenantReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.tenants(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                null,
                null
        ));
    }

    @GetMapping("/reports/schools")
    ResponseEntity<SuperAdminPageResponse<SuperAdminSchoolResponse>> schoolReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.schools(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                null,
                null,
                null
        ));
    }

    @GetMapping("/reports/exports")
    ResponseEntity<SuperAdminPageResponse<SuperAdminReportExportResponse>> reportExports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String reportType,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.reportExports(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                status,
                reportType
        ));
    }

    @PostMapping("/reports/exports")
    ResponseEntity<SuperAdminReportExportResponse> reportExportRequest(
            @Valid @RequestBody SuperAdminReportExportRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(superAdminPlatformService.requestReportExport(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/reports/exports/{jobId}")
    ResponseEntity<SuperAdminReportExportResponse> reportExport(
            @PathVariable String jobId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.reportExport(
                authenticatedUserResolver.requireUser(request),
                jobId
        ));
    }

    @GetMapping("/audit-logs")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAuditLogResponse>> auditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String action,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.auditLogs(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                tenantId,
                role,
                action
        ));
    }

    @GetMapping("/platform-health")
    ResponseEntity<SuperAdminPlatformHealthResponse> platformHealth(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.platformHealth(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/notifications/summary")
    ResponseEntity<SuperAdminNotificationSummaryResponse> notificationSummary(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.notificationSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/notifications/deliveries")
    ResponseEntity<SuperAdminPageResponse<SuperAdminNotificationDeliveryResponse>> notificationDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.notificationDeliveries(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                status,
                channel,
                tenantId
        ));
    }

    @GetMapping("/notifications/deliveries/{deliveryId}")
    ResponseEntity<SuperAdminNotificationDeliveryResponse> notificationDelivery(
            @PathVariable String deliveryId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.notificationDelivery(
                authenticatedUserResolver.requireUser(request),
                deliveryId
        ));
    }

    @GetMapping("/settings")
    ResponseEntity<SuperAdminSettingsResponse> settings(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminPlatformService.settings(authenticatedUserResolver.requireUser(request)));
    }

    @PatchMapping("/settings")
    ResponseEntity<SuperAdminSettingsResponse> updateSettings(
            @Valid @RequestBody SuperAdminSettingsUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.updateSettings(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/search")
    ResponseEntity<SuperAdminSearchResponse> search(
            @RequestParam String q,
            @RequestParam(required = false) String types,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminPlatformService.search(
                authenticatedUserResolver.requireUser(request),
                q,
                types,
                page,
                size
        ));
    }
}
