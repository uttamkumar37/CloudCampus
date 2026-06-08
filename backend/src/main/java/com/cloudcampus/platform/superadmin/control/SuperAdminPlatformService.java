package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.events.outbox.OutboxEvent;
import com.cloudcampus.events.outbox.OutboxEventRepository;
import com.cloudcampus.events.outbox.OutboxEventStatus;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.intelligence.ai.AiRequestAudit;
import com.cloudcampus.intelligence.ai.AiRequestAuditRepository;
import com.cloudcampus.intelligence.ai.AiTenantEntitlement;
import com.cloudcampus.intelligence.ai.AiTenantEntitlementRepository;
import com.cloudcampus.intelligence.ai.AiUsageStatus;
import com.cloudcampus.notification.NotificationDelivery;
import com.cloudcampus.notification.NotificationDeliveryRepository;
import com.cloudcampus.notification.NotificationDeliveryStatus;
import com.cloudcampus.operations.bulk.BulkJob;
import com.cloudcampus.operations.bulk.BulkJobCreateRequest;
import com.cloudcampus.operations.bulk.BulkJobRepository;
import com.cloudcampus.operations.bulk.BulkJobService;
import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.operations.report.ReportExportFormat;
import com.cloudcampus.operations.report.ReportExportJob;
import com.cloudcampus.operations.report.ReportExportJobRepository;
import com.cloudcampus.operations.report.ReportType;
import com.cloudcampus.people.staff.StaffProfileRepository;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.platform.subscription.BillingCycle;
import com.cloudcampus.platform.subscription.SubscriptionPlan;
import com.cloudcampus.platform.subscription.SubscriptionPlanRepository;
import com.cloudcampus.platform.subscription.TenantInvoice;
import com.cloudcampus.platform.subscription.TenantInvoiceRepository;
import com.cloudcampus.platform.subscription.TenantInvoiceStatus;
import com.cloudcampus.platform.subscription.TenantSubscription;
import com.cloudcampus.platform.subscription.TenantSubscriptionRepository;
import com.cloudcampus.platform.superadmin.stats.PlatformStats;
import com.cloudcampus.platform.superadmin.stats.PlatformStatsRepository;
import com.cloudcampus.platform.superadmin.stats.SchoolStats;
import com.cloudcampus.platform.superadmin.stats.SchoolStatsRepository;
import com.cloudcampus.platform.superadmin.stats.TenantStats;
import com.cloudcampus.platform.superadmin.stats.TenantStatsRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.platform.tenant.TenantStatus;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuperAdminPlatformService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<BulkJobStatus> ACTIVE_REPORT_STATUSES = Set.of(
            BulkJobStatus.QUEUED,
            BulkJobStatus.VALIDATING,
            BulkJobStatus.PROCESSING
    );

    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final StudentRepository studentRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final TenantInvoiceRepository tenantInvoiceRepository;
    private final AiTenantEntitlementRepository aiTenantEntitlementRepository;
    private final AiRequestAuditRepository aiRequestAuditRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationDeliveryRepository notificationDeliveryRepository;
    private final ReportExportJobRepository reportExportJobRepository;
    private final BulkJobRepository bulkJobRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final AuditLogService auditLogService;
    private final BulkJobService bulkJobService;
    private final TenantStatsRepository tenantStatsRepository;
    private final SchoolStatsRepository schoolStatsRepository;
    private final PlatformStatsRepository platformStatsRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final ObjectMapper objectMapper;
    private final String frontendUrl;
    private final String corsAllowedOrigins;
    private final String notificationMode;

    public SuperAdminPlatformService(
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            StudentRepository studentRepository,
            StaffProfileRepository staffProfileRepository,
            SubscriptionPlanRepository subscriptionPlanRepository,
            TenantSubscriptionRepository tenantSubscriptionRepository,
            TenantInvoiceRepository tenantInvoiceRepository,
            AiTenantEntitlementRepository aiTenantEntitlementRepository,
            AiRequestAuditRepository aiRequestAuditRepository,
            AuditLogRepository auditLogRepository,
            NotificationDeliveryRepository notificationDeliveryRepository,
            ReportExportJobRepository reportExportJobRepository,
            BulkJobRepository bulkJobRepository,
            OutboxEventRepository outboxEventRepository,
            AuditLogService auditLogService,
            BulkJobService bulkJobService,
            TenantStatsRepository tenantStatsRepository,
            SchoolStatsRepository schoolStatsRepository,
            PlatformStatsRepository platformStatsRepository,
            PlatformSettingsRepository platformSettingsRepository,
            ObjectMapper objectMapper,
            @Value("${cloudcampus.frontend.public-url:${cloudcampus.notifications.email.app-base-url:http://localhost:5173}}") String frontendUrl,
            @Value("${cloudcampus.cors.allowed-origins:http://localhost:5173}") String corsAllowedOrigins,
            @Value("${cloudcampus.notifications.email.mode:log}") String notificationMode
    ) {
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.studentRepository = studentRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.tenantInvoiceRepository = tenantInvoiceRepository;
        this.aiTenantEntitlementRepository = aiTenantEntitlementRepository;
        this.aiRequestAuditRepository = aiRequestAuditRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationDeliveryRepository = notificationDeliveryRepository;
        this.reportExportJobRepository = reportExportJobRepository;
        this.bulkJobRepository = bulkJobRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.auditLogService = auditLogService;
        this.bulkJobService = bulkJobService;
        this.tenantStatsRepository = tenantStatsRepository;
        this.schoolStatsRepository = schoolStatsRepository;
        this.platformStatsRepository = platformStatsRepository;
        this.platformSettingsRepository = platformSettingsRepository;
        this.objectMapper = objectMapper;
        this.frontendUrl = frontendUrl;
        this.corsAllowedOrigins = corsAllowedOrigins;
        this.notificationMode = notificationMode;
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminTenantResponse> tenants(
            AuthenticatedUser actor,
            int page,
            int size,
            String search,
            String status
    ) {
        requireSuperAdmin(actor);
        Page<Tenant> tenantPage = tenantRepository.findAll(
                tenantSpec(search, status),
                pageable(page, size, "createdAt,desc", Set.of("createdAt", "name", "code", "status"))
        );
        return page(tenantPage, tenantResponses(tenantPage.getContent()));
    }

    @Transactional(readOnly = true)
    public SuperAdminTenantResponse tenant(AuthenticatedUser actor, String tenantId) {
        requireSuperAdmin(actor);
        return tenantResponse(requireTenant(tenantId));
    }

    @Transactional
    public SuperAdminTenantResponse updateTenantStatus(
            AuthenticatedUser authenticatedUser,
            String tenantId,
            TenantStatusUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        if (request.status() == null) {
            throw new BadRequestException("Tenant status is required.");
        }
        Tenant tenant = requireTenant(tenantId);
        TenantStatus oldStatus = tenant.getStatus();
        tenant.updateStatus(request.status());
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TENANT_STATUS_UPDATED,
                "Tenant",
                tenant.getId(),
                "Tenant status updated by Super Admin.",
                Map.of("tenantId", tenant.getId(), "oldStatus", oldStatus.name(), "newStatus", tenant.getStatus().name())
        );
        return tenantResponse(tenant);
    }

    @Transactional
    public SuperAdminTenantResponse updateTenantSettings(
            AuthenticatedUser authenticatedUser,
            String tenantId,
            TenantSettingsUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        if (request.name() == null || request.name().isBlank()) {
            throw new BadRequestException("Tenant name is required.");
        }
        Tenant tenant = requireTenant(tenantId);
        String oldName = tenant.getName();
        tenant.rename(request.name());
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TENANT_SETTINGS_UPDATED,
                "Tenant",
                tenant.getId(),
                "Tenant settings updated by Super Admin.",
                Map.of("tenantId", tenant.getId(), "oldName", oldName, "newName", tenant.getName())
        );
        return tenantResponse(tenant);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminSchoolResponse> schoolsForTenant(
            AuthenticatedUser actor,
            String tenantId,
            int page,
            int size
    ) {
        requireSuperAdmin(actor);
        requireTenant(tenantId);
        Page<School> schoolPage = schoolRepository.findAll(
                schoolSpec(null, tenantId, null),
                pageable(page, size, "name,asc", Set.of("createdAt", "name", "code"))
        );
        return page(schoolPage, schoolResponses(schoolPage.getContent()));
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminUserResponse> usersForTenant(
            AuthenticatedUser actor,
            String tenantId,
            int page,
            int size
    ) {
        requireSuperAdmin(actor);
        requireTenant(tenantId);
        return page(userAccountRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(user -> new SuperAdminUserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getDisplayName(),
                        user.getRole().name(),
                        user.getStatus().name(),
                        user.getActivatedAt()
                ))
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAuditLogResponse> auditForTenant(
            AuthenticatedUser actor,
            String tenantId,
            int page,
            int size
    ) {
        requireSuperAdmin(actor);
        requireTenant(tenantId);
        return auditLogs(actor, page, size, tenantId, null, null);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminSchoolResponse> schools(
            AuthenticatedUser actor,
            int page,
            int size,
            String search,
            String tenantId,
            String status
    ) {
        requireSuperAdmin(actor);
        Page<School> schoolPage = schoolRepository.findAll(
                schoolSpec(search, tenantId, status),
                pageable(page, size, "createdAt,desc", Set.of("createdAt", "name", "code", "active"))
        );
        return page(schoolPage, schoolResponses(schoolPage.getContent()));
    }

    @Transactional(readOnly = true)
    public SuperAdminSchoolResponse school(AuthenticatedUser actor, String schoolId) {
        requireSuperAdmin(actor);
        return schoolResponse(schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found.")));
    }

    @Transactional(readOnly = true)
    public SuperAdminRevenueSummaryResponse revenueSummary(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        List<TenantInvoice> invoices = tenantInvoiceRepository.findAllByOrderByIssuedAtDesc();
        List<TenantSubscription> subscriptions = tenantSubscriptionRepository.findAllByOrderByUpdatedAtDesc();
        long mrr = subscriptions.stream()
                .filter(subscription -> subscription.getStatus().name().equals("ACTIVE"))
                .mapToLong(subscription -> monthlyAmount(subscription.getPlan(), subscription.getBillingCycle()))
                .sum();
        long totalInvoiced = invoices.stream().mapToLong(TenantInvoice::getAmountCents).sum();
        Instant now = Instant.now();
        long issued = invoices.stream().filter(invoice -> invoice.getStatus() == TenantInvoiceStatus.ISSUED).count();
        long paid = invoices.stream().filter(invoice -> invoice.getStatus() == TenantInvoiceStatus.PAID).count();
        long overdue = invoices.stream().filter(invoice -> isOverdue(invoice, now)).count();
        long pending = invoices.stream()
                .filter(invoice -> invoice.getStatus() == TenantInvoiceStatus.ISSUED || invoice.getStatus() == TenantInvoiceStatus.PENDING)
                .filter(invoice -> !isOverdue(invoice, now))
                .count();
        return new SuperAdminRevenueSummaryResponse(
                mrr,
                mrr * 12,
                totalInvoiced,
                issued,
                paid,
                pending,
                overdue,
                invoiceTrend(invoices),
                revenueBreakdown(invoices, invoice -> invoice.getTenant().getId(), invoice -> invoice.getTenant().getName()),
                revenueBreakdown(invoices, invoice -> invoice.getPlan().getCode(), invoice -> invoice.getPlan().getName())
        );
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminInvoiceResponse> invoices(
            AuthenticatedUser actor,
            int page,
            int size,
            String status
    ) {
        requireSuperAdmin(actor);
        Page<TenantInvoice> invoicePage = tenantInvoiceRepository.findAll(
                invoiceSpec(status),
                pageable(page, size, "issuedAt,desc", Set.of("issuedAt", "dueAt", "status", "amountCents"))
        );
        return page(invoicePage.map(this::invoiceResponse));
    }

    @Transactional(readOnly = true)
    public SuperAdminAiUsageSummaryResponse aiUsageSummary(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        List<AiTenantEntitlement> entitlements = aiTenantEntitlementRepository.findAll();
        List<AiRequestAudit> audits = aiRequestAuditRepository.findAllByOrderByCreatedAtDesc();
        Instant monthStart = monthStart();
        long used = audits.stream()
                .filter(audit -> audit.getStatus() == AiUsageStatus.AUTHORIZED)
                .filter(audit -> !audit.getCreatedAt().isBefore(monthStart))
                .mapToLong(audit -> audit.getEstimatedInputUnits() + audit.getEstimatedOutputUnits())
                .sum();
        long denied = audits.stream()
                .filter(audit -> audit.getStatus() == AiUsageStatus.DENIED)
                .filter(audit -> !audit.getCreatedAt().isBefore(monthStart))
                .count();
        long budgetExceeded = audits.stream()
                .filter(audit -> audit.getStatus() == AiUsageStatus.DENIED)
                .filter(audit -> audit.getDenialReason() != null && audit.getDenialReason().toLowerCase(Locale.ROOT).contains("budget"))
                .filter(audit -> !audit.getCreatedAt().isBefore(monthStart))
                .count();
        return new SuperAdminAiUsageSummaryResponse(
                entitlements.stream().filter(AiTenantEntitlement::isEnabled).count(),
                entitlements.stream().mapToLong(AiTenantEntitlement::getMonthlyUnitBudget).sum(),
                used,
                denied,
                budgetExceeded,
                entitlements.stream().map(this::aiTenantUsage).toList(),
                audits.stream().limit(50).map(this::aiAudit).toList()
        );
    }

    @Transactional(readOnly = true)
    public List<SuperAdminAiTenantUsageResponse> aiTenantUsage(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        return aiTenantEntitlementRepository.findAll().stream().map(this::aiTenantUsage).toList();
    }

    @Transactional(readOnly = true)
    public SuperAdminReportsSummaryResponse reportsSummary(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        List<ReportExportJob> exports = reportExportJobRepository.findAllByOrderByRequestedAtDesc();
        return new SuperAdminReportsSummaryResponse(
                List.of(
                        metric("Tenant growth reports", String.valueOf(tenantRepository.count()), "Tenant records available"),
                        metric("School growth reports", String.valueOf(schoolRepository.count()), "School records available"),
                        metric("Subscription reports", String.valueOf(tenantSubscriptionRepository.count()), "Assigned subscriptions"),
                        metric("Invoice reports", String.valueOf(tenantInvoiceRepository.count()), "Internal invoices"),
                        metric("AI usage reports", String.valueOf(aiRequestAuditRepository.count()), "Token-safe usage audit rows"),
                        metric("Notification reports", String.valueOf(notificationDeliveryRepository.count()), "Delivery rows")
                ),
                exports.stream().limit(50).map(this::reportExportResponse).toList()
        );
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminReportExportResponse> reportExports(AuthenticatedUser actor, int page, int size) {
        return reportExports(actor, page, size, null, null);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminReportExportResponse> reportExports(
            AuthenticatedUser actor,
            int page,
            int size,
            String status,
            String reportType
    ) {
        requireSuperAdmin(actor);
        Page<ReportExportJob> exportPage = reportExportJobRepository.findAll(
                reportExportSpec(status, reportType),
                pageable(page, size, "requestedAt,desc", Set.of("requestedAt", "reportType", "format"))
        );
        return page(exportPage.map(this::reportExportResponse));
    }

    @Transactional(readOnly = true)
    public SuperAdminReportExportResponse reportExport(AuthenticatedUser actor, String jobId) {
        requireSuperAdmin(actor);
        return reportExportResponse(reportExportJobRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Report export was not found.")));
    }

    @Transactional
    public SuperAdminReportExportResponse requestReportExport(
            AuthenticatedUser authenticatedUser,
            SuperAdminReportExportRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        ReportType reportType = parseEnum(
                ReportType.class,
                blankDefault(request.reportType(), ReportType.PLATFORM_SUMMARY.name()),
                "Report type is not supported."
        );
        ReportExportFormat format = parseEnum(
                ReportExportFormat.class,
                blankDefault(request.format(), ReportExportFormat.CSV.name()),
                "Report format is not supported."
        );
        var bulkJob = bulkJobService.createPlatformJob(
                authenticatedUser,
                new BulkJobCreateRequest(
                        "REPORT_EXPORT",
                        0,
                        null,
                        Map.of(
                                "reportType", reportType.name(),
                                "format", format.name(),
                                "tenantId", blankDefault(request.tenantId(), ""),
                                "schoolId", blankDefault(request.schoolId(), "")
                        )
                )
        );
        BulkJob bulkJobEntity = bulkJobRepository.findById(bulkJob.id())
                .orElseThrow(() -> new NotFoundException("Bulk job was not found."));
        Tenant actorTenant = requireTenant(actor.getTenant().getId());
        ReportExportJob exportJob = reportExportJobRepository.save(new ReportExportJob(
                actorTenant,
                actor,
                bulkJobEntity,
                reportType,
                format,
                filtersJson(request.filters())
        ));
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.REPORT_EXPORT_REQUESTED,
                "ReportExportJob",
                exportJob.getId(),
                "Platform report export requested by Super Admin.",
                Map.of(
                        "reportExportId", exportJob.getId(),
                        "bulkJobId", exportJob.getBulkJob().getId(),
                        "reportType", reportType.name(),
                        "format", format.name(),
                        "tenantScoped", request.tenantId() != null && !request.tenantId().isBlank(),
                        "schoolScoped", request.schoolId() != null && !request.schoolId().isBlank()
                )
        );
        return reportExportResponse(exportJob);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAuditLogResponse> auditLogs(
            AuthenticatedUser actor,
            int page,
            int size,
            String tenantId,
            String role,
            String action
    ) {
        requireSuperAdmin(actor);
        Page<AuditLog> auditPage = auditLogRepository.findAll(
                auditSpec(tenantId, role, action),
                pageable(page, size, "createdAt,desc", Set.of("createdAt", "action", "actorType"))
        );
        return page(auditPage, auditResponses(auditPage.getContent()));
    }

    @Transactional(readOnly = true)
    public SuperAdminPlatformHealthResponse platformHealth(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        long pendingOutbox = outboxEventRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING).size();
        long pendingReports = bulkJobRepository.countByJobTypeAndStatusIn("REPORT_EXPORT", ACTIVE_REPORT_STATUSES);
        List<SuperAdminAlertResponse> alerts = new ArrayList<>();
        if (pendingOutbox > 0) {
            alerts.add(new SuperAdminAlertResponse("Outbox backlog", pendingOutbox + " pending platform events", "warning", Instant.now()));
        }
        if ("log".equalsIgnoreCase(notificationMode)) {
            alerts.add(new SuperAdminAlertResponse("Email log mode", "Notifications are logged instead of delivered.", "info", Instant.now()));
        }
        return new SuperAdminPlatformHealthResponse(
                "UP",
                "READY",
                "CONNECTED",
                "FLYWAY_ENABLED",
                notificationMode,
                pendingOutbox,
                pendingReports,
                aiTenantEntitlementRepository.findAll().stream().filter(AiTenantEntitlement::isEnabled).count(),
                "0.1.0-SNAPSHOT",
                Instant.now(),
                alerts
        );
    }

    @Transactional(readOnly = true)
    public SuperAdminNotificationSummaryResponse notificationSummary(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        List<NotificationDelivery> deliveries = notificationDeliveryRepository.findTop10ByOrderByCreatedAtDesc();
        return new SuperAdminNotificationSummaryResponse(
                notificationDeliveryRepository.count(),
                notificationDeliveryRepository.countByStatus(NotificationDeliveryStatus.SENT),
                notificationDeliveryRepository.countByStatus(NotificationDeliveryStatus.LOGGED),
                notificationDeliveryRepository.countByStatus(NotificationDeliveryStatus.FAILED),
                notificationDeliveryRepository.countByStatus(NotificationDeliveryStatus.DISABLED),
                notificationResponses(deliveries)
        );
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminNotificationDeliveryResponse> notificationDeliveries(
            AuthenticatedUser actor,
            int page,
            int size,
            String status,
            String channel,
            String tenantId
    ) {
        requireSuperAdmin(actor);
        Page<NotificationDelivery> deliveryPage = notificationDeliveryRepository.findAll(
                notificationSpec(status, channel, tenantId),
                pageable(page, size, "createdAt,desc", Set.of("createdAt", "status", "channel"))
        );
        return page(deliveryPage, notificationResponses(deliveryPage.getContent()));
    }

    @Transactional(readOnly = true)
    public SuperAdminNotificationDeliveryResponse notificationDelivery(AuthenticatedUser actor, String deliveryId) {
        requireSuperAdmin(actor);
        return notificationResponse(notificationDeliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new NotFoundException("Notification delivery was not found.")));
    }

    @Transactional(readOnly = true)
    public SuperAdminSettingsResponse settings(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        PlatformSettings settings = platformSettingsRepository.findById(PlatformSettings.PLATFORM_ID)
                .orElseGet(() -> new PlatformSettings("CloudCampus", "support@cloudcampus.dev", "UTC", false, null));
        return settingsResponse(
                settings.getPlatformName(),
                settings.getSupportEmail(),
                settings.getDefaultTimezone(),
                settings.isMaintenanceMode()
        );
    }

    @Transactional
    public SuperAdminSettingsResponse updateSettings(
            AuthenticatedUser authenticatedUser,
            SuperAdminSettingsUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        String platformName = normalizeRequired(request.platformName(), "Platform name is required.");
        String supportEmail = normalizeEmail(request.supportEmail());
        String timezone = normalizeTimezone(request.defaultTimezone());
        PlatformSettings settings = platformSettingsRepository.findById(PlatformSettings.PLATFORM_ID)
                .orElseGet(() -> new PlatformSettings(platformName, supportEmail, timezone, request.maintenanceMode(), actor));
        settings.update(platformName, supportEmail, timezone, request.maintenanceMode(), actor, Instant.now());
        platformSettingsRepository.save(settings);
        SuperAdminSettingsResponse response = settingsResponse(platformName, supportEmail, timezone, request.maintenanceMode());
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.PLATFORM_SETTINGS_UPDATED,
                "PlatformSettings",
                "runtime",
                "Safe platform settings updated by Super Admin.",
                Map.of(
                        "platformName", response.platformName(),
                        "supportEmail", response.supportEmail(),
                        "defaultTimezone", response.defaultTimezone(),
                        "maintenanceMode", response.maintenanceMode()
                )
        );
        return response;
    }

    @Transactional(readOnly = true)
    public SuperAdminPlatformMetricsResponse platformMetrics(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        PlatformStats stats = platformStatsRepository.findById(PlatformStats.PLATFORM_ID).orElse(null);
        Instant now = Instant.now();
        return new SuperAdminPlatformMetricsResponse(
                tenantRepository.count(),
                tenantRepository.count((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), TenantStatus.ACTIVE)),
                schoolRepository.count(),
                schoolRepository.countByActiveTrue(),
                studentRepository.count(),
                studentRepository.countByActiveTrue(),
                staffProfileRepository.count(),
                staffProfileRepository.countByActiveTrue(),
                userAccountRepository.count(),
                userAccountRepository.countByStatus(com.cloudcampus.identity.auth.UserStatus.ACTIVE),
                tenantInvoiceRepository.countByStatus(TenantInvoiceStatus.ISSUED)
                        + tenantInvoiceRepository.countByStatus(TenantInvoiceStatus.PENDING),
                tenantInvoiceRepository.countByStatus(TenantInvoiceStatus.OVERDUE),
                tenantInvoiceRepository.countByStatus(TenantInvoiceStatus.PAID),
                notificationDeliveryRepository.countByStatus(NotificationDeliveryStatus.FAILED),
                outboxEventRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING).size(),
                bulkJobRepository.countByJobTypeAndStatusIn("REPORT_EXPORT", ACTIVE_REPORT_STATUSES),
                stats == null ? now : stats.getLastCalculatedAt()
        );
    }

    @Transactional(readOnly = true)
    public SuperAdminSearchResponse search(
            AuthenticatedUser actor,
            String q,
            String types,
            int page,
            int size
    ) {
        requireSuperAdmin(actor);
        String needle = normalizeRequired(q, "Search query is required.").toLowerCase(Locale.ROOT);
        Set<String> allowedTypes = parseTypes(types);
        List<SuperAdminSearchResultResponse> results = new ArrayList<>();
        if (allowedTypes.isEmpty() || allowedTypes.contains("tenant")) {
            tenantRepository.findAll(tenantSpec(needle, null), PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")))
                    .forEach(tenant -> results.add(new SuperAdminSearchResultResponse(
                            tenant.getId(),
                            "tenant",
                            tenant.getName(),
                            tenant.getCode() + " - " + tenant.getStatus().name(),
                            "tenants",
                            tenant.getCreatedAt()
                    )));
        }
        if (allowedTypes.isEmpty() || allowedTypes.contains("school")) {
            schoolRepository.findAll(schoolSpec(needle, null, null), PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")))
                    .forEach(school -> results.add(new SuperAdminSearchResultResponse(
                            school.getId(),
                            "school",
                            school.getName(),
                            school.getCode() + " - " + school.getTenant().getName(),
                            "schools",
                            school.getCreatedAt()
                    )));
        }
        if (allowedTypes.isEmpty() || allowedTypes.contains("invoice")) {
            tenantInvoiceRepository.findAll(invoiceSearchSpec(needle), PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "issuedAt")))
                    .forEach(invoice -> results.add(new SuperAdminSearchResultResponse(
                            invoice.getId(),
                            "invoice",
                            invoice.getInvoiceNumber(),
                            invoice.getTenant().getName() + " - " + invoice.getStatus().name(),
                            "revenue",
                            invoice.getIssuedAt()
                    )));
        }
        if (allowedTypes.isEmpty() || allowedTypes.contains("audit")) {
            auditLogRepository.findAll(auditSearchSpec(needle), PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")))
                    .forEach(log -> results.add(new SuperAdminSearchResultResponse(
                            log.getId(),
                            "audit",
                            log.getAction().name(),
                            log.getSummary(),
                            "audit",
                            log.getCreatedAt()
                    )));
        }
        results.sort(Comparator.comparing(SuperAdminSearchResultResponse::createdAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return pageSearch(results, page, size);
    }

    private UserAccount requireSuperAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can access platform control APIs.");
        }
        return actor;
    }

    private Tenant requireTenant(String tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
    }

    private SuperAdminTenantResponse tenantResponse(Tenant tenant) {
        Map<String, TenantStats> stats = tenantStats(List.of(tenant.getId()));
        Map<String, TenantAggregateCount> schoolCounts = schoolCountsByTenant(List.of(tenant.getId()));
        Map<String, TenantAggregateCount> userCounts = userCountsByTenant(List.of(tenant.getId()));
        Map<String, TenantSubscription> subscriptions = subscriptionsByTenant(List.of(tenant.getId()));
        return tenantResponse(tenant, stats.get(tenant.getId()), schoolCounts.get(tenant.getId()), userCounts.get(tenant.getId()), subscriptions.get(tenant.getId()));
    }

    private List<SuperAdminTenantResponse> tenantResponses(List<Tenant> tenants) {
        List<String> tenantIds = tenants.stream().map(Tenant::getId).toList();
        Map<String, TenantStats> stats = tenantStats(tenantIds);
        Map<String, TenantAggregateCount> schoolCounts = schoolCountsByTenant(tenantIds);
        Map<String, TenantAggregateCount> userCounts = userCountsByTenant(tenantIds);
        Map<String, TenantSubscription> subscriptions = subscriptionsByTenant(tenantIds);
        return tenants.stream()
                .map(tenant -> tenantResponse(
                        tenant,
                        stats.get(tenant.getId()),
                        schoolCounts.get(tenant.getId()),
                        userCounts.get(tenant.getId()),
                        subscriptions.get(tenant.getId())
                ))
                .toList();
    }

    private SuperAdminTenantResponse tenantResponse(
            Tenant tenant,
            TenantStats stats,
            TenantAggregateCount schoolCounts,
            TenantAggregateCount userCounts,
            TenantSubscription subscription
    ) {
        long schoolCount = stats == null ? total(schoolCounts) : stats.getSchoolCount();
        long activeSchoolCount = stats == null ? active(schoolCounts) : stats.getActiveSchoolCount();
        long userCount = stats == null ? total(userCounts) : stats.getUserCount();
        return new SuperAdminTenantResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getStatus().name(),
                schoolCount,
                activeSchoolCount,
                userCount,
                subscription == null ? "SCAFFOLD" : subscription.getPlan().getCode(),
                subscription == null ? "Scaffold default" : subscription.getPlan().getName(),
                tenant.getCreatedAt()
        );
    }

    private SuperAdminSchoolResponse schoolResponse(School school) {
        Map<String, SchoolStats> stats = schoolStats(List.of(school.getId()));
        Map<String, SchoolAggregateCount> studentCounts = studentCountsBySchool(List.of(school.getId()));
        Map<String, SchoolAggregateCount> staffCounts = staffCountsBySchool(List.of(school.getId()));
        Map<String, SchoolActivityAggregate> activities = activityBySchool(List.of(school.getId()));
        return schoolResponse(
                school,
                stats.get(school.getId()),
                studentCounts.get(school.getId()),
                staffCounts.get(school.getId()),
                activities.get(school.getId())
        );
    }

    private List<SuperAdminSchoolResponse> schoolResponses(List<School> schools) {
        List<String> schoolIds = schools.stream().map(School::getId).toList();
        Map<String, SchoolStats> stats = schoolStats(schoolIds);
        Map<String, SchoolAggregateCount> studentCounts = studentCountsBySchool(schoolIds);
        Map<String, SchoolAggregateCount> staffCounts = staffCountsBySchool(schoolIds);
        Map<String, SchoolActivityAggregate> activities = activityBySchool(schoolIds);
        return schools.stream()
                .map(school -> schoolResponse(
                        school,
                        stats.get(school.getId()),
                        studentCounts.get(school.getId()),
                        staffCounts.get(school.getId()),
                        activities.get(school.getId())
                ))
                .toList();
    }

    private SuperAdminSchoolResponse schoolResponse(
            School school,
            SchoolStats stats,
            SchoolAggregateCount studentCounts,
            SchoolAggregateCount staffCounts,
            SchoolActivityAggregate activity
    ) {
        return new SuperAdminSchoolResponse(
                school.getId(),
                school.getCode(),
                school.getName(),
                school.getTenant().getId(),
                school.getTenant().getCode(),
                school.getTenant().getName(),
                schoolStatus(school),
                school.isPrimarySchool(),
                stats == null ? active(studentCounts) : stats.getActiveStudentCount(),
                stats == null ? active(staffCounts) : stats.getActiveStaffCount(),
                school.getCreatedAt(),
                stats == null ? (activity == null ? null : activity.lastActivityAt()) : stats.getLastActivityAt()
        );
    }

    private SuperAdminInvoiceResponse invoiceResponse(TenantInvoice invoice) {
        return new SuperAdminInvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getTenant().getId(),
                invoice.getTenant().getName(),
                invoice.getPlan().getCode(),
                invoice.getBillingCycle().name(),
                invoice.getAmountCents(),
                invoice.getCurrency(),
                invoice.getStatus().name(),
                invoice.getIssuedAt(),
                invoice.getDueAt()
        );
    }

    private SuperAdminAiTenantUsageResponse aiTenantUsage(AiTenantEntitlement entitlement) {
        long used = aiRequestAuditRepository.sumAuthorizedUnitsSince(entitlement.getTenant().getId(), monthStart());
        return new SuperAdminAiTenantUsageResponse(
                entitlement.getTenant().getId(),
                entitlement.getTenant().getName(),
                entitlement.isEnabled(),
                entitlement.getMonthlyUnitBudget(),
                used,
                Math.max(entitlement.getMonthlyUnitBudget() - used, 0),
                entitlement.isHumanApprovalRequired(),
                entitlement.getEnabledFeatures().stream().map(Enum::name).sorted().toList(),
                entitlement.getUpdatedAt()
        );
    }

    private SuperAdminAiAuditResponse aiAudit(AiRequestAudit audit) {
        return new SuperAdminAiAuditResponse(
                audit.getId(),
                audit.getTenant().getId(),
                audit.getTenant().getName(),
                audit.getUserRole().name(),
                audit.getFeature().name(),
                audit.getStatus().name(),
                audit.getEstimatedInputUnits() + audit.getEstimatedOutputUnits(),
                audit.getEstimatedCostCents(),
                audit.getDenialReason(),
                audit.getCreatedAt()
        );
    }

    private SuperAdminAuditLogResponse auditResponse(AuditLog log) {
        return auditResponse(log, Map.of(), Map.of());
    }

    private List<SuperAdminAuditLogResponse> auditResponses(List<AuditLog> logs) {
        Map<String, String> tenantNames = tenantNames(logs.stream().map(AuditLog::getTenantId).filter(Objects::nonNull).collect(Collectors.toSet()));
        Map<String, String> schoolNames = schoolNames(logs.stream().map(AuditLog::getSchoolId).filter(Objects::nonNull).collect(Collectors.toSet()));
        return logs.stream().map(log -> auditResponse(log, tenantNames, schoolNames)).toList();
    }

    private SuperAdminAuditLogResponse auditResponse(AuditLog log, Map<String, String> tenantNames, Map<String, String> schoolNames) {
        String tenantName = log.getTenantId() == null ? null : tenantNames.get(log.getTenantId());
        String schoolName = log.getSchoolId() == null ? null : schoolNames.get(log.getSchoolId());
        return new SuperAdminAuditLogResponse(
                log.getId(),
                log.getTenantId(),
                tenantName,
                log.getSchoolId(),
                schoolName,
                log.getActorType(),
                log.getActorId(),
                log.getAction().name(),
                log.getEntityType(),
                log.getEntityId(),
                log.getSummary(),
                safeMetadata(log.getMetadataJson()),
                log.getCreatedAt()
        );
    }

    private SuperAdminNotificationDeliveryResponse notificationResponse(NotificationDelivery delivery) {
        return notificationResponse(delivery, Map.of(), Map.of());
    }

    private List<SuperAdminNotificationDeliveryResponse> notificationResponses(List<NotificationDelivery> deliveries) {
        Map<String, String> tenantNames = tenantNames(deliveries.stream().map(NotificationDelivery::getTenantId).filter(Objects::nonNull).collect(Collectors.toSet()));
        Map<String, String> schoolNames = schoolNames(deliveries.stream().map(NotificationDelivery::getSchoolId).filter(Objects::nonNull).collect(Collectors.toSet()));
        return deliveries.stream().map(delivery -> notificationResponse(delivery, tenantNames, schoolNames)).toList();
    }

    private SuperAdminNotificationDeliveryResponse notificationResponse(
            NotificationDelivery delivery,
            Map<String, String> tenantNames,
            Map<String, String> schoolNames
    ) {
        return new SuperAdminNotificationDeliveryResponse(
                delivery.getId(),
                delivery.getTenantId(),
                tenantNames.get(delivery.getTenantId()),
                delivery.getSchoolId(),
                schoolNames.get(delivery.getSchoolId()),
                delivery.getChannel(),
                delivery.getTemplate(),
                delivery.getRecipientRole(),
                delivery.getMaskedRecipient(),
                delivery.getSubject(),
                delivery.getStatus().name(),
                delivery.getProvider(),
                delivery.getLastError(),
                delivery.getCreatedAt(),
                delivery.getSentAt(),
                delivery.getFailedAt()
        );
    }

    private SuperAdminReportExportResponse reportExportResponse(ReportExportJob job) {
        return new SuperAdminReportExportResponse(
                job.getId(),
                job.getTenant().getId(),
                job.getTenant().getName(),
                job.getSchool() == null ? null : job.getSchool().getId(),
                job.getSchool() == null ? "Platform-wide" : job.getSchool().getName(),
                job.getReportType().name(),
                job.getFormat().name(),
                job.getBulkJob().getStatus().name(),
                job.getRequestedAt(),
                job.getCompletedAt()
        );
    }

    private SuperAdminSettingsResponse settingsResponse(
            String platformName,
            String supportEmail,
            String defaultTimezone,
            boolean maintenanceMode
    ) {
        return new SuperAdminSettingsResponse(
                platformName,
                supportEmail,
                defaultTimezone,
                frontendUrl,
                splitCsv(corsAllowedOrigins),
                notificationMode,
                "Tenant entitlement controls enabled; raw prompts are never exposed.",
                maintenanceMode,
                Map.of(
                        "jwtSecret", "configured/hidden",
                        "database", "configured/hidden",
                        "smtpSecret", "configured/hidden"
                )
        );
    }

    private Instant latestSchoolActivity(String schoolId) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(log -> schoolId.equals(log.getSchoolId()))
                .findFirst()
                .map(AuditLog::getCreatedAt)
                .orElse(null);
    }

    private String schoolStatus(School school) {
        return school.isActive() ? "ACTIVE" : "INACTIVE";
    }

    private long monthlyAmount(SubscriptionPlan plan, BillingCycle billingCycle) {
        if (billingCycle == BillingCycle.ANNUAL) {
            return Math.round(plan.getAnnualPriceCents() / 12.0d);
        }
        return plan.getMonthlyPriceCents();
    }

    private List<SuperAdminTrendPointResponse> invoiceTrend(List<TenantInvoice> invoices) {
        Map<YearMonth, Long> byMonth = new LinkedHashMap<>();
        YearMonth current = YearMonth.now(ZoneOffset.UTC);
        for (int index = 5; index >= 0; index--) {
            byMonth.put(current.minusMonths(index), 0L);
        }
        for (TenantInvoice invoice : invoices) {
            YearMonth month = YearMonth.from(invoice.getIssuedAt().atZone(ZoneOffset.UTC));
            if (byMonth.containsKey(month)) {
                byMonth.put(month, byMonth.get(month) + invoice.getAmountCents());
            }
        }
        return byMonth.entrySet().stream()
                .map(entry -> new SuperAdminTrendPointResponse(entry.getKey().toString(), entry.getValue()))
                .toList();
    }

    private List<SuperAdminRevenueBreakdownResponse> revenueBreakdown(
            List<TenantInvoice> invoices,
            Function<TenantInvoice, String> id,
            Function<TenantInvoice, String> label
    ) {
        Map<String, Long> amount = new HashMap<>();
        Map<String, Long> count = new HashMap<>();
        Map<String, String> labels = new HashMap<>();
        for (TenantInvoice invoice : invoices) {
            String key = id.apply(invoice);
            amount.put(key, amount.getOrDefault(key, 0L) + invoice.getAmountCents());
            count.put(key, count.getOrDefault(key, 0L) + 1);
            labels.put(key, label.apply(invoice));
        }
        return amount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new SuperAdminRevenueBreakdownResponse(
                        entry.getKey(),
                        labels.get(entry.getKey()),
                        entry.getValue(),
                        count.getOrDefault(entry.getKey(), 0L)
                ))
                .toList();
    }

    private List<SuperAdminTrendPointResponse> growthTrend(List<? extends Object> entities, Function<Object, Instant> createdAt) {
        Map<YearMonth, Long> byMonth = new LinkedHashMap<>();
        YearMonth current = YearMonth.now(ZoneOffset.UTC);
        for (int index = 5; index >= 0; index--) {
            byMonth.put(current.minusMonths(index), 0L);
        }
        for (Object entity : entities) {
            Instant instant = createdAt.apply(entity);
            if (instant != null) {
                YearMonth month = YearMonth.from(instant.atZone(ZoneOffset.UTC));
                if (byMonth.containsKey(month)) {
                    byMonth.put(month, byMonth.get(month) + 1);
                }
            }
        }
        return byMonth.entrySet().stream()
                .map(entry -> new SuperAdminTrendPointResponse(entry.getKey().toString(), entry.getValue()))
                .toList();
    }

    private SuperAdminMetricResponse metric(String label, String value, String detail) {
        return new SuperAdminMetricResponse(label, value, detail);
    }

    private long countDeliveries(List<NotificationDelivery> deliveries, NotificationDeliveryStatus status) {
        return deliveries.stream().filter(delivery -> delivery.getStatus() == status).count();
    }

    private Instant monthStart() {
        return Instant.now().atZone(ZoneOffset.UTC).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return List.of(value.split(",")).stream().map(String::trim).filter(item -> !item.isBlank()).toList();
    }

    private String blankDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private String normalizeEmail(String value) {
        String email = normalizeRequired(value, "Support email is required.").toLowerCase(Locale.ROOT);
        if (!email.contains("@") || email.startsWith("@") || email.endsWith("@")) {
            throw new BadRequestException("Support email must be valid.");
        }
        return email;
    }

    private String normalizeTimezone(String value) {
        String timezone = normalizeRequired(value, "Default timezone is required.");
        try {
            ZoneId.of(timezone);
            return timezone;
        } catch (RuntimeException exception) {
            throw new BadRequestException("Default timezone must be valid.");
        }
    }

    private boolean isOverdue(TenantInvoice invoice, Instant now) {
        return invoice.getStatus() == TenantInvoiceStatus.OVERDUE
                || ((invoice.getStatus() == TenantInvoiceStatus.ISSUED || invoice.getStatus() == TenantInvoiceStatus.PENDING)
                && invoice.getDueAt() != null
                && invoice.getDueAt().isBefore(now));
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String value, String message) {
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException exception) {
            throw new BadRequestException(message);
        }
    }

    private String filtersJson(Map<String, Object> filters) {
        if (filters == null || filters.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(filters);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Report export filters must be JSON serializable.");
        }
    }

    private Specification<Tenant> tenantSpec(String search, String status) {
        TenantStatus tenantStatus = status == null || status.isBlank()
                ? null
                : parseEnum(TenantStatus.class, status, "Tenant status filter is not supported.");
        String needle = search == null || search.isBlank() ? null : "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (needle != null) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), needle),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), needle)
                ));
            }
            if (tenantStatus != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), tenantStatus));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<School> schoolSpec(String search, String tenantId, String status) {
        Boolean active = null;
        if (status != null && !status.isBlank()) {
            if ("ACTIVE".equalsIgnoreCase(status)) {
                active = true;
            } else if ("INACTIVE".equalsIgnoreCase(status) || "SUSPENDED".equalsIgnoreCase(status)) {
                active = false;
            } else {
                throw new BadRequestException("School status filter is not supported.");
            }
        }
        Boolean activeFilter = active;
        String normalizedTenantId = tenantId == null || tenantId.isBlank() ? null : tenantId.trim();
        String needle = search == null || search.isBlank() ? null : "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (normalizedTenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), normalizedTenantId));
            }
            if (activeFilter != null) {
                predicates.add(criteriaBuilder.equal(root.get("active"), activeFilter));
            }
            if (needle != null) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), needle),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), needle),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("tenant").get("name")), needle)
                ));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<TenantInvoice> invoiceSpec(String status) {
        TenantInvoiceStatus invoiceStatus = status == null || status.isBlank()
                ? null
                : parseEnum(TenantInvoiceStatus.class, status, "Invoice status filter is not supported.");
        return (root, query, criteriaBuilder) -> invoiceStatus == null
                ? criteriaBuilder.conjunction()
                : criteriaBuilder.equal(root.get("status"), invoiceStatus);
    }

    private Specification<TenantInvoice> invoiceSearchSpec(String search) {
        String needle = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("invoiceNumber")), needle),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("tenant").get("name")), needle),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("plan").get("code")), needle)
        );
    }

    private Specification<ReportExportJob> reportExportSpec(String status, String reportType) {
        BulkJobStatus bulkStatus = status == null || status.isBlank()
                ? null
                : parseEnum(BulkJobStatus.class, status, "Report export status filter is not supported.");
        ReportType type = reportType == null || reportType.isBlank()
                ? null
                : parseEnum(ReportType.class, reportType, "Report type filter is not supported.");
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (bulkStatus != null) {
                predicates.add(criteriaBuilder.equal(root.get("bulkJob").get("status"), bulkStatus));
            }
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("reportType"), type));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<AuditLog> auditSpec(String tenantId, String role, String action) {
        String normalizedTenantId = tenantId == null || tenantId.isBlank() ? null : tenantId.trim();
        String normalizedRole = role == null || role.isBlank() ? null : role.trim().toUpperCase(Locale.ROOT);
        String actionNeedle = action == null || action.isBlank() ? null : "%" + action.trim().toUpperCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (normalizedTenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenantId"), normalizedTenantId));
            }
            if (normalizedRole != null) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("actorType")), normalizedRole));
            }
            if (actionNeedle != null) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.upper(root.get("action").as(String.class)), actionNeedle));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<AuditLog> auditSearchSpec(String search) {
        String needle = "%" + search.trim().toUpperCase(Locale.ROOT) + "%";
        String lowerNeedle = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.upper(root.get("action").as(String.class)), needle),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("summary")), lowerNeedle),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("entityType")), lowerNeedle)
        );
    }

    private Specification<NotificationDelivery> notificationSpec(String status, String channel, String tenantId) {
        NotificationDeliveryStatus deliveryStatus = status == null || status.isBlank()
                ? null
                : parseEnum(NotificationDeliveryStatus.class, status, "Notification status filter is not supported.");
        String normalizedChannel = channel == null || channel.isBlank() ? null : channel.trim().toUpperCase(Locale.ROOT);
        String normalizedTenantId = tenantId == null || tenantId.isBlank() ? null : tenantId.trim();
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (deliveryStatus != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), deliveryStatus));
            }
            if (normalizedChannel != null) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("channel")), normalizedChannel));
            }
            if (normalizedTenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenantId"), normalizedTenantId));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Pageable pageable(int page, int size, String defaultSort, Set<String> allowedSorts) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        String[] parts = defaultSort.split(",", 2);
        String property = allowedSorts.contains(parts[0]) ? parts[0] : allowedSorts.iterator().next();
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, property));
    }

    private <S, T> SuperAdminPageResponse<T> page(Page<S> source, List<T> items) {
        return new SuperAdminPageResponse<>(
                items,
                source.getNumber(),
                source.getSize(),
                source.getTotalElements(),
                source.getTotalPages()
        );
    }

    private <T> SuperAdminPageResponse<T> page(Page<T> source) {
        return page(source, source.getContent());
    }

    private SuperAdminSearchResponse pageSearch(List<SuperAdminSearchResultResponse> rows, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int from = Math.min(safePage * safeSize, rows.size());
        int to = Math.min(from + safeSize, rows.size());
        int totalPages = rows.isEmpty() ? 0 : (int) Math.ceil(rows.size() / (double) safeSize);
        return new SuperAdminSearchResponse(rows.subList(from, to), safePage, safeSize, rows.size(), totalPages);
    }

    private Set<String> parseTypes(String types) {
        if (types == null || types.isBlank()) {
            return Set.of();
        }
        Set<String> allowed = Set.of("tenant", "school", "invoice", "audit");
        Set<String> parsed = new HashSet<>();
        for (String type : types.split(",")) {
            String normalized = type.trim().toLowerCase(Locale.ROOT);
            if (normalized.isBlank()) {
                continue;
            }
            if (!allowed.contains(normalized)) {
                throw new BadRequestException("Search type is not supported.");
            }
            parsed.add(normalized);
        }
        return parsed;
    }

    private Map<String, TenantStats> tenantStats(Collection<String> tenantIds) {
        if (tenantIds.isEmpty()) {
            return Map.of();
        }
        return tenantStatsRepository.findByTenantIdIn(tenantIds).stream()
                .collect(Collectors.toMap(TenantStats::getTenantId, Function.identity()));
    }

    private Map<String, SchoolStats> schoolStats(Collection<String> schoolIds) {
        if (schoolIds.isEmpty()) {
            return Map.of();
        }
        return schoolStatsRepository.findBySchoolIdIn(schoolIds).stream()
                .collect(Collectors.toMap(SchoolStats::getSchoolId, Function.identity()));
    }

    private Map<String, TenantAggregateCount> schoolCountsByTenant(Collection<String> tenantIds) {
        if (tenantIds.isEmpty()) {
            return Map.of();
        }
        return schoolRepository.countByTenantIds(tenantIds).stream()
                .collect(Collectors.toMap(TenantAggregateCount::tenantId, Function.identity()));
    }

    private Map<String, TenantAggregateCount> userCountsByTenant(Collection<String> tenantIds) {
        if (tenantIds.isEmpty()) {
            return Map.of();
        }
        return userAccountRepository.countByTenantIds(tenantIds).stream()
                .collect(Collectors.toMap(TenantAggregateCount::tenantId, Function.identity()));
    }

    private Map<String, TenantSubscription> subscriptionsByTenant(Collection<String> tenantIds) {
        if (tenantIds.isEmpty()) {
            return Map.of();
        }
        return tenantSubscriptionRepository.findAllById(tenantIds).stream()
                .collect(Collectors.toMap(subscription -> subscription.getTenant().getId(), Function.identity()));
    }

    private Map<String, SchoolAggregateCount> studentCountsBySchool(Collection<String> schoolIds) {
        if (schoolIds.isEmpty()) {
            return Map.of();
        }
        return studentRepository.countBySchoolIds(schoolIds).stream()
                .collect(Collectors.toMap(SchoolAggregateCount::schoolId, Function.identity()));
    }

    private Map<String, SchoolAggregateCount> staffCountsBySchool(Collection<String> schoolIds) {
        if (schoolIds.isEmpty()) {
            return Map.of();
        }
        return staffProfileRepository.countBySchoolIds(schoolIds).stream()
                .collect(Collectors.toMap(SchoolAggregateCount::schoolId, Function.identity()));
    }

    private Map<String, SchoolActivityAggregate> activityBySchool(Collection<String> schoolIds) {
        if (schoolIds.isEmpty()) {
            return Map.of();
        }
        return auditLogRepository.latestActivityBySchoolIds(schoolIds).stream()
                .collect(Collectors.toMap(SchoolActivityAggregate::schoolId, Function.identity()));
    }

    private Map<String, String> tenantNames(Collection<String> tenantIds) {
        if (tenantIds.isEmpty()) {
            return Map.of();
        }
        return tenantRepository.findAllById(tenantIds).stream()
                .collect(Collectors.toMap(Tenant::getId, Tenant::getName));
    }

    private Map<String, String> schoolNames(Collection<String> schoolIds) {
        if (schoolIds.isEmpty()) {
            return Map.of();
        }
        return schoolRepository.findAllById(schoolIds).stream()
                .collect(Collectors.toMap(School::getId, School::getName));
    }

    private long total(TenantAggregateCount count) {
        return count == null ? 0 : count.totalCount();
    }

    private long active(TenantAggregateCount count) {
        return count == null ? 0 : count.activeCount();
    }

    private long active(SchoolAggregateCount count) {
        return count == null ? 0 : count.activeCount();
    }

    private String safeMetadata(String metadataJson) {
        if (metadataJson == null) {
            return null;
        }
        return metadataJson
                .replaceAll("(?i)\"token\"\\s*:\\s*\"[^\"]+\"", "\"token\":\"[redacted]\"")
                .replaceAll("(?i)\"password\"\\s*:\\s*\"[^\"]+\"", "\"password\":\"[redacted]\"")
                .replaceAll("(?i)\"mfaCode\"\\s*:\\s*\"[^\"]+\"", "\"mfaCode\":\"[redacted]\"")
                .replaceAll("(?i)\"secret\"\\s*:\\s*\"[^\"]+\"", "\"secret\":\"[redacted]\"")
                .replaceAll("(?i)\"apiKey\"\\s*:\\s*\"[^\"]+\"", "\"apiKey\":\"[redacted]\"")
                .replaceAll("(?i)\"rawPrompt\"\\s*:\\s*\"[^\"]+\"", "\"rawPrompt\":\"[redacted]\"")
                .replaceAll("(?i)\"privateKey\"\\s*:\\s*\"[^\"]+\"", "\"privateKey\":\"[redacted]\"")
                .replaceAll("(?i)\"accessToken\"\\s*:\\s*\"[^\"]+\"", "\"accessToken\":\"[redacted]\"")
                .replaceAll("(?i)\"refreshToken\"\\s*:\\s*\"[^\"]+\"", "\"refreshToken\":\"[redacted]\"");
    }

    private <T> Predicate<T> searchFilter(String search, Function<T, String> searchableText) {
        if (search == null || search.isBlank()) {
            return item -> true;
        }
        String needle = search.toLowerCase(Locale.ROOT).trim();
        return item -> Optional.ofNullable(searchableText.apply(item)).orElse("").toLowerCase(Locale.ROOT).contains(needle);
    }

    private <T> SuperAdminPageResponse<T> page(List<T> rows, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int from = Math.min(safePage * safeSize, rows.size());
        int to = Math.min(from + safeSize, rows.size());
        int totalPages = rows.isEmpty() ? 0 : (int) Math.ceil(rows.size() / (double) safeSize);
        return new SuperAdminPageResponse<>(rows.subList(from, to), safePage, safeSize, rows.size(), totalPages);
    }
}
