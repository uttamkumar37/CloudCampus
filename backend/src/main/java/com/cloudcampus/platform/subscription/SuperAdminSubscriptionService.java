package com.cloudcampus.platform.subscription;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuperAdminSubscriptionService {

    private static final int DEFAULT_MAX_SCHOOLS = 1;
    private static final String DEFAULT_PLAN_CODE = "SCAFFOLD";

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final TenantInvoiceRepository tenantInvoiceRepository;
    private final TenantSchoolLimitRepository tenantSchoolLimitRepository;
    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final AuditLogService auditLogService;

    public SuperAdminSubscriptionService(
            SubscriptionPlanRepository subscriptionPlanRepository,
            TenantSubscriptionRepository tenantSubscriptionRepository,
            TenantInvoiceRepository tenantInvoiceRepository,
            TenantSchoolLimitRepository tenantSchoolLimitRepository,
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            AuditLogService auditLogService
    ) {
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.tenantInvoiceRepository = tenantInvoiceRepository;
        this.tenantSchoolLimitRepository = tenantSchoolLimitRepository;
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> plans(AuthenticatedUser authenticatedUser) {
        requireSuperAdmin(authenticatedUser);
        return subscriptionPlanRepository.findAllByOrderByCodeAsc()
                .stream()
                .map(this::toPlanResponse)
                .toList();
    }

    @Transactional
    public SubscriptionPlanResponse createPlan(AuthenticatedUser authenticatedUser, SubscriptionPlanRequest request) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        String code = normalizeCode(request.code());
        if (subscriptionPlanRepository.existsByCode(code)) {
            throw new ConflictException("Subscription plan code already exists.");
        }
        validatePlanValues(request.maxSchools(), request.maxStudents(), request.maxStaff(), request.monthlyPriceCents(), request.annualPriceCents());
        SubscriptionPlan plan = subscriptionPlanRepository.save(new SubscriptionPlan(
                code,
                request.name(),
                request.description(),
                request.maxSchools(),
                request.maxStudents(),
                request.maxStaff(),
                request.monthlyPriceCents(),
                request.annualPriceCents(),
                normalizeCurrency(request.currency())
        ));
        plan.update(
                request.name(),
                request.description(),
                request.maxSchools(),
                request.maxStudents(),
                request.maxStaff(),
                request.monthlyPriceCents(),
                request.annualPriceCents(),
                normalizeCurrency(request.currency()),
                request.status() == null ? SubscriptionPlanStatus.ACTIVE : request.status()
        );
        recordPlanCreated(actor, plan);
        return toPlanResponse(plan);
    }

    @Transactional
    public SubscriptionPlanResponse updatePlan(
            AuthenticatedUser authenticatedUser,
            String planId,
            SubscriptionPlanRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new NotFoundException("Subscription plan was not found."));
        validatePlanValues(request.maxSchools(), request.maxStudents(), request.maxStaff(), request.monthlyPriceCents(), request.annualPriceCents());
        assertAssignedTenantsFitPlan(plan, request.maxSchools());
        String oldName = plan.getName();
        SubscriptionPlanStatus status = request.status() == null ? plan.getStatus() : request.status();
        plan.update(
                request.name(),
                request.description(),
                request.maxSchools(),
                request.maxStudents(),
                request.maxStaff(),
                request.monthlyPriceCents(),
                request.annualPriceCents(),
                normalizeCurrency(request.currency()),
                status
        );
        recordPlanUpdated(actor, plan, oldName);
        return toPlanResponse(plan);
    }

    @Transactional(readOnly = true)
    public TenantSubscriptionResponse tenantSubscription(AuthenticatedUser authenticatedUser, String tenantId) {
        requireSuperAdmin(authenticatedUser);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
        return tenantSubscriptionRepository.findById(tenant.getId())
                .map(subscription -> toSubscriptionResponse(subscription, null))
                .orElseGet(() -> defaultSubscriptionResponse(tenant));
    }

    @Transactional
    public TenantSubscriptionResponse assignTenantSubscription(
            AuthenticatedUser authenticatedUser,
            String tenantId,
            TenantSubscriptionAssignmentRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
        SubscriptionPlan plan = subscriptionPlanRepository.findByCode(normalizeCode(request.planCode()))
                .orElseThrow(() -> new NotFoundException("Subscription plan was not found."));
        if (plan.getStatus() != SubscriptionPlanStatus.ACTIVE) {
            throw new ConflictException("Archived subscription plans cannot be assigned.");
        }
        long schoolsUsed = schoolRepository.countByTenantId(tenant.getId());
        if (schoolsUsed > plan.getMaxSchools()) {
            throw new ConflictException("Tenant already uses more schools than the selected plan allows.");
        }

        BillingCycle billingCycle = request.billingCycle() == null ? BillingCycle.MONTHLY : request.billingCycle();
        Instant periodStart = request.currentPeriodStart() == null ? Instant.now() : request.currentPeriodStart();
        TenantSubscription subscription = tenantSubscriptionRepository.findById(tenant.getId())
                .orElseGet(() -> tenantSubscriptionRepository.save(new TenantSubscription(
                        tenant,
                        plan,
                        billingCycle,
                        periodStart,
                        request.currentPeriodEnd(),
                        actor
                )));
        subscription.assign(plan, billingCycle, periodStart, request.currentPeriodEnd(), actor);
        upsertSchoolLimit(tenant.getId(), plan.getMaxSchools());

        TenantInvoice invoice = null;
        if (request.issueInvoice()) {
            invoice = tenantInvoiceRepository.save(new TenantInvoice(
                    tenant,
                    plan,
                    invoiceNumber(tenant),
                    billingCycle,
                    amountFor(plan, billingCycle),
                    plan.getCurrency(),
                    request.invoiceDueAt()
            ));
            recordInvoiceIssued(actor, invoice);
        }
        recordTenantSubscriptionAssigned(actor, subscription, schoolsUsed, invoice);
        return toSubscriptionResponse(subscription, invoice);
    }

    @Transactional(readOnly = true)
    public List<TenantInvoiceResponse> tenantInvoices(AuthenticatedUser authenticatedUser, String tenantId) {
        requireSuperAdmin(authenticatedUser);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
        return tenantInvoiceRepository.findByTenantIdOrderByIssuedAtDesc(tenant.getId())
                .stream()
                .map(this::toInvoiceResponse)
                .toList();
    }

    private UserAccount requireSuperAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can manage subscription plans.");
        }
        return actor;
    }

    private void validatePlanValues(int maxSchools, int maxStudents, int maxStaff, long monthlyPriceCents, long annualPriceCents) {
        if (maxSchools < 1 || maxStudents < 0 || maxStaff < 0 || monthlyPriceCents < 0 || annualPriceCents < 0) {
            throw new BadRequestException("Subscription plan limits and prices must be non-negative, with at least one school.");
        }
    }

    private void assertAssignedTenantsFitPlan(SubscriptionPlan plan, int proposedMaxSchools) {
        for (TenantSubscription subscription : tenantSubscriptionRepository.findByPlanId(plan.getId())) {
            long schoolsUsed = schoolRepository.countByTenantId(subscription.getTenant().getId());
            if (schoolsUsed > proposedMaxSchools) {
                throw new ConflictException("Assigned tenants already use more schools than the proposed plan limit.");
            }
        }
    }

    private void upsertSchoolLimit(String tenantId, int maxSchools) {
        TenantSchoolLimit limit = tenantSchoolLimitRepository.findById(tenantId)
                .orElseGet(() -> tenantSchoolLimitRepository.save(new TenantSchoolLimit(tenantId, maxSchools)));
        limit.updateMaxSchools(maxSchools);
    }

    private long amountFor(SubscriptionPlan plan, BillingCycle billingCycle) {
        return billingCycle == BillingCycle.ANNUAL ? plan.getAnnualPriceCents() : plan.getMonthlyPriceCents();
    }

    private String invoiceNumber(Tenant tenant) {
        long sequence = tenantInvoiceRepository.countByTenantId(tenant.getId()) + 1;
        return "INV-" + tenant.getCode() + "-" + String.format(Locale.ROOT, "%04d", sequence);
    }

    private TenantSubscriptionResponse defaultSubscriptionResponse(Tenant tenant) {
        int maxSchools = tenantSchoolLimitRepository.findById(tenant.getId())
                .map(TenantSchoolLimit::getMaxSchools)
                .orElse(DEFAULT_MAX_SCHOOLS);
        long schoolsUsed = schoolRepository.countByTenantId(tenant.getId());
        return new TenantSubscriptionResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getStatus().name(),
                false,
                null,
                DEFAULT_PLAN_CODE,
                "Scaffold default",
                null,
                null,
                maxSchools,
                0,
                0,
                schoolsUsed,
                Math.max(maxSchools - schoolsUsed, 0),
                null,
                null,
                null,
                null,
                null
        );
    }

    private TenantSubscriptionResponse toSubscriptionResponse(TenantSubscription subscription, TenantInvoice invoice) {
        Tenant tenant = subscription.getTenant();
        SubscriptionPlan plan = subscription.getPlan();
        long schoolsUsed = schoolRepository.countByTenantId(tenant.getId());
        return new TenantSubscriptionResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getStatus().name(),
                true,
                plan.getId(),
                plan.getCode(),
                plan.getName(),
                subscription.getStatus(),
                subscription.getBillingCycle(),
                plan.getMaxSchools(),
                plan.getMaxStudents(),
                plan.getMaxStaff(),
                schoolsUsed,
                Math.max(plan.getMaxSchools() - schoolsUsed, 0),
                subscription.getCurrentPeriodStart(),
                subscription.getCurrentPeriodEnd(),
                subscription.getAssignedBy().getId(),
                subscription.getAssignedAt(),
                invoice == null ? null : toInvoiceResponse(invoice)
        );
    }

    private SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        return new SubscriptionPlanResponse(
                plan.getId(),
                plan.getCode(),
                plan.getName(),
                plan.getDescription(),
                plan.getStatus(),
                plan.getMaxSchools(),
                plan.getMaxStudents(),
                plan.getMaxStaff(),
                plan.getMonthlyPriceCents(),
                plan.getAnnualPriceCents(),
                plan.getCurrency(),
                plan.getCreatedAt(),
                plan.getUpdatedAt()
        );
    }

    private TenantInvoiceResponse toInvoiceResponse(TenantInvoice invoice) {
        return new TenantInvoiceResponse(
                invoice.getId(),
                invoice.getTenant().getId(),
                invoice.getPlan().getId(),
                invoice.getPlan().getCode(),
                invoice.getInvoiceNumber(),
                invoice.getBillingCycle(),
                invoice.getAmountCents(),
                invoice.getCurrency(),
                invoice.getStatus(),
                invoice.getIssuedAt(),
                invoice.getDueAt()
        );
    }

    private void recordPlanCreated(UserAccount actor, SubscriptionPlan plan) {
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SUBSCRIPTION_PLAN_CREATED,
                "SubscriptionPlan",
                plan.getId(),
                "Subscription plan created by Super Admin.",
                planMetadata(plan, actor)
        );
    }

    private void recordPlanUpdated(UserAccount actor, SubscriptionPlan plan, String oldName) {
        auditLogService.record(
                actor.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SUBSCRIPTION_PLAN_UPDATED,
                "SubscriptionPlan",
                plan.getId(),
                "Subscription plan updated by Super Admin.",
                withOldName(planMetadata(plan, actor), oldName)
        );
    }

    private void recordTenantSubscriptionAssigned(
            UserAccount actor,
            TenantSubscription subscription,
            long schoolsUsed,
            TenantInvoice invoice
    ) {
        auditLogService.record(
                subscription.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TENANT_SUBSCRIPTION_ASSIGNED,
                "TenantSubscription",
                subscription.getTenant().getId(),
                "Tenant subscription assigned by Super Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", subscription.getTenant().getId(),
                        "planId", subscription.getPlan().getId(),
                        "planCode", subscription.getPlan().getCode(),
                        "billingCycle", subscription.getBillingCycle().name(),
                        "maxSchools", subscription.getPlan().getMaxSchools(),
                        "schoolsUsed", schoolsUsed,
                        "invoiceId", invoice == null ? "" : invoice.getId()
                )
        );
    }

    private void recordInvoiceIssued(UserAccount actor, TenantInvoice invoice) {
        auditLogService.record(
                invoice.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.TENANT_INVOICE_ISSUED,
                "TenantInvoice",
                invoice.getId(),
                "Tenant invoice issued by Super Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", invoice.getTenant().getId(),
                        "planId", invoice.getPlan().getId(),
                        "planCode", invoice.getPlan().getCode(),
                        "invoiceNumber", invoice.getInvoiceNumber(),
                        "billingCycle", invoice.getBillingCycle().name(),
                        "amountCents", invoice.getAmountCents(),
                        "currency", invoice.getCurrency()
                )
        );
    }

    private Map<String, ?> planMetadata(SubscriptionPlan plan, UserAccount actor) {
        return Map.of(
                "actorRole", actor.getRole().name(),
                "planId", plan.getId(),
                "planCode", plan.getCode(),
                "status", plan.getStatus().name(),
                "maxSchools", plan.getMaxSchools(),
                "maxStudents", plan.getMaxStudents(),
                "maxStaff", plan.getMaxStaff(),
                "currency", plan.getCurrency()
        );
    }

    private Map<String, ?> withOldName(Map<String, ?> metadata, String oldName) {
        java.util.LinkedHashMap<String, Object> values = new java.util.LinkedHashMap<>(metadata);
        values.put("oldName", oldName);
        return values;
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeCurrency(String currency) {
        return currency.trim().toUpperCase(Locale.ROOT);
    }
}
