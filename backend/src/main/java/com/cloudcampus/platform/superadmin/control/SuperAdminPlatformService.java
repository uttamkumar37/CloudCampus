package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLog;
import com.cloudcampus.audit.AuditLogRepository;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
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
import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.operations.report.ReportExportJob;
import com.cloudcampus.operations.report.ReportExportJobRepository;
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
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.platform.tenant.TenantStatus;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuperAdminPlatformService {

    private static final int MAX_PAGE_SIZE = 100;

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
    private final OutboxEventRepository outboxEventRepository;
    private final AuditLogService auditLogService;
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
            OutboxEventRepository outboxEventRepository,
            AuditLogService auditLogService,
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
        this.outboxEventRepository = outboxEventRepository;
        this.auditLogService = auditLogService;
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
        List<SuperAdminTenantResponse> rows = tenantRepository.findAll().stream()
                .filter(searchFilter(search, tenant -> tenant.getCode() + " " + tenant.getName()))
                .filter(tenant -> status == null || status.isBlank() || tenant.getStatus().name().equalsIgnoreCase(status))
                .sorted(Comparator.comparing(Tenant::getCreatedAt).reversed())
                .map(this::tenantResponse)
                .toList();
        return page(rows, page, size);
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
        return page(schoolRepository.findByTenantIdOrderByNameAsc(tenantId).stream()
                .map(this::schoolResponse)
                .toList(), page, size);
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
        return page(auditLogRepository.findByTenantId(tenantId).stream()
                .sorted(Comparator.comparing(AuditLog::getCreatedAt).reversed())
                .map(this::auditResponse)
                .toList(), page, size);
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
        List<SuperAdminSchoolResponse> rows = schoolRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(school -> tenantId == null || tenantId.isBlank() || school.getTenant().getId().equals(tenantId))
                .filter(searchFilter(search, school -> school.getCode() + " " + school.getName() + " " + school.getTenant().getName()))
                .filter(school -> status == null || status.isBlank() || schoolStatus(school).equalsIgnoreCase(status))
                .map(this::schoolResponse)
                .toList();
        return page(rows, page, size);
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
        long issued = invoices.stream().filter(invoice -> invoice.getStatus() == TenantInvoiceStatus.ISSUED).count();
        long overdue = invoices.stream()
                .filter(invoice -> invoice.getStatus() == TenantInvoiceStatus.ISSUED)
                .filter(invoice -> invoice.getDueAt() != null && invoice.getDueAt().isBefore(Instant.now()))
                .count();
        return new SuperAdminRevenueSummaryResponse(
                mrr,
                mrr * 12,
                totalInvoiced,
                invoices.size(),
                0,
                issued,
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
        return page(tenantInvoiceRepository.findAllByOrderByIssuedAtDesc().stream()
                .filter(invoice -> status == null || status.isBlank() || invoice.getStatus().name().equalsIgnoreCase(status))
                .map(this::invoiceResponse)
                .toList(), page, size);
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
        requireSuperAdmin(actor);
        return page(reportExportJobRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(this::reportExportResponse)
                .toList(), page, size);
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
        return page(auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(log -> tenantId == null || tenantId.isBlank() || log.getTenantId().equals(tenantId))
                .filter(log -> role == null || role.isBlank() || log.getActorType().equalsIgnoreCase(role))
                .filter(log -> action == null || action.isBlank() || log.getAction().name().contains(action.toUpperCase(Locale.ROOT)))
                .map(this::auditResponse)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public SuperAdminPlatformHealthResponse platformHealth(AuthenticatedUser actor) {
        requireSuperAdmin(actor);
        long pendingOutbox = outboxEventRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING).size();
        long pendingReports = reportExportJobRepository.findAll().stream()
                .filter(job -> job.getBulkJob().getStatus() == BulkJobStatus.QUEUED || job.getBulkJob().getStatus() == BulkJobStatus.PROCESSING)
                .count();
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
        List<NotificationDelivery> deliveries = notificationDeliveryRepository.findAllByOrderByCreatedAtDesc();
        return new SuperAdminNotificationSummaryResponse(
                deliveries.size(),
                countDeliveries(deliveries, NotificationDeliveryStatus.SENT),
                countDeliveries(deliveries, NotificationDeliveryStatus.LOGGED),
                countDeliveries(deliveries, NotificationDeliveryStatus.FAILED),
                countDeliveries(deliveries, NotificationDeliveryStatus.DISABLED),
                deliveries.stream().limit(50).map(this::notificationResponse).toList()
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
        return page(notificationDeliveryRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(delivery -> status == null || status.isBlank() || delivery.getStatus().name().equalsIgnoreCase(status))
                .filter(delivery -> channel == null || channel.isBlank() || delivery.getChannel().equalsIgnoreCase(channel))
                .filter(delivery -> tenantId == null || tenantId.isBlank() || delivery.getTenantId().equals(tenantId))
                .map(this::notificationResponse)
                .toList(), page, size);
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
        return settingsResponse("CloudCampus", "support@cloudcampus.dev", "UTC", false);
    }

    @Transactional
    public SuperAdminSettingsResponse updateSettings(
            AuthenticatedUser authenticatedUser,
            SuperAdminSettingsUpdateRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        SuperAdminSettingsResponse response = settingsResponse(
                blankDefault(request.platformName(), "CloudCampus"),
                blankDefault(request.supportEmail(), "support@cloudcampus.dev"),
                blankDefault(request.defaultTimezone(), "UTC"),
                request.maintenanceMode()
        );
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
        Optional<TenantSubscription> subscription = tenantSubscriptionRepository.findById(tenant.getId());
        return new SuperAdminTenantResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getStatus().name(),
                schoolRepository.countByTenantId(tenant.getId()),
                schoolRepository.countByTenantIdAndActiveTrue(tenant.getId()),
                userAccountRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId()).size(),
                subscription.map(item -> item.getPlan().getCode()).orElse("SCAFFOLD"),
                subscription.map(item -> item.getPlan().getName()).orElse("Scaffold default"),
                tenant.getCreatedAt()
        );
    }

    private SuperAdminSchoolResponse schoolResponse(School school) {
        return new SuperAdminSchoolResponse(
                school.getId(),
                school.getCode(),
                school.getName(),
                school.getTenant().getId(),
                school.getTenant().getCode(),
                school.getTenant().getName(),
                schoolStatus(school),
                school.isPrimarySchool(),
                studentRepository.countBySchoolIdAndActiveTrue(school.getId()),
                staffProfileRepository.countBySchoolIdAndActiveTrue(school.getId()),
                school.getCreatedAt(),
                latestSchoolActivity(school.getId())
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
        Tenant tenant = log.getTenantId() == null ? null : tenantRepository.findById(log.getTenantId()).orElse(null);
        School school = log.getSchoolId() == null ? null : schoolRepository.findById(log.getSchoolId()).orElse(null);
        return new SuperAdminAuditLogResponse(
                log.getId(),
                log.getTenantId(),
                tenant == null ? null : tenant.getName(),
                log.getSchoolId(),
                school == null ? null : school.getName(),
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
        Tenant tenant = tenantRepository.findById(delivery.getTenantId()).orElse(null);
        School school = delivery.getSchoolId() == null ? null : schoolRepository.findById(delivery.getSchoolId()).orElse(null);
        return new SuperAdminNotificationDeliveryResponse(
                delivery.getId(),
                delivery.getTenantId(),
                tenant == null ? null : tenant.getName(),
                delivery.getSchoolId(),
                school == null ? null : school.getName(),
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
                job.getSchool().getId(),
                job.getSchool().getName(),
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

    private String safeMetadata(String metadataJson) {
        if (metadataJson == null) {
            return null;
        }
        return metadataJson
                .replaceAll("(?i)\"token\"\\s*:\\s*\"[^\"]+\"", "\"token\":\"[redacted]\"")
                .replaceAll("(?i)\"password\"\\s*:\\s*\"[^\"]+\"", "\"password\":\"[redacted]\"")
                .replaceAll("(?i)\"mfaCode\"\\s*:\\s*\"[^\"]+\"", "\"mfaCode\":\"[redacted]\"");
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
