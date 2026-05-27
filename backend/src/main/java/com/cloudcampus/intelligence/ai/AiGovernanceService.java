package com.cloudcampus.intelligence.ai;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiGovernanceService {

    private static final int DEFAULT_RETENTION_DAYS = 90;

    private final AiTenantEntitlementRepository aiTenantEntitlementRepository;
    private final AiRequestAuditRepository aiRequestAuditRepository;
    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final AuditLogService auditLogService;

    public AiGovernanceService(
            AiTenantEntitlementRepository aiTenantEntitlementRepository,
            AiRequestAuditRepository aiRequestAuditRepository,
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            AuditLogService auditLogService
    ) {
        this.aiTenantEntitlementRepository = aiTenantEntitlementRepository;
        this.aiRequestAuditRepository = aiRequestAuditRepository;
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public AiEntitlementResponse entitlementForTenant(AuthenticatedUser authenticatedUser, String tenantId) {
        requireSuperAdmin(authenticatedUser);
        Tenant tenant = tenant(tenantId);
        return entitlementResponse(tenant, aiTenantEntitlementRepository.findById(tenant.getId()).orElse(null));
    }

    @Transactional
    public AiEntitlementResponse updateTenantEntitlement(
            AuthenticatedUser authenticatedUser,
            String tenantId,
            AiEntitlementRequest request
    ) {
        UserAccount actor = requireSuperAdmin(authenticatedUser);
        Tenant tenant = tenant(tenantId);
        Set<AiFeature> features = features(request);
        if (request.enabled() && features.isEmpty()) {
            throw new BadRequestException("Enabled AI entitlements require at least one feature.");
        }
        AiTenantEntitlement entitlement = aiTenantEntitlementRepository.findById(tenant.getId())
                .orElseGet(() -> aiTenantEntitlementRepository.save(new AiTenantEntitlement(
                        tenant,
                        false,
                        0,
                        EnumSet.noneOf(AiFeature.class),
                        true,
                        DEFAULT_RETENTION_DAYS,
                        actor
                )));
        entitlement.update(
                request.enabled(),
                request.monthlyUnitBudget(),
                features,
                request.humanApprovalRequired(),
                request.retentionDays(),
                actor
        );
        recordEntitlementUpdated(actor, entitlement);
        return entitlementResponse(tenant, entitlement);
    }

    @Transactional(readOnly = true)
    public AiEntitlementResponse currentTenantEntitlement(AuthenticatedUser authenticatedUser) {
        Tenant tenant = authenticatedUser.user().getTenant();
        return entitlementResponse(tenant, aiTenantEntitlementRepository.findById(tenant.getId()).orElse(null));
    }

    @Transactional(noRollbackFor = {ForbiddenException.class, ConflictException.class})
    public AiUsageAuditResponse recordUsageAudit(AuthenticatedUser authenticatedUser, AiUsageAuditRequest request) {
        UserAccount actor = authenticatedUser.user();
        Tenant tenant = actor.getTenant();
        School activeSchool = activeSchool(authenticatedUser, tenant);
        AiTenantEntitlement entitlement = aiTenantEntitlementRepository.findById(tenant.getId()).orElse(null);
        long requestedUnits = request.estimatedInputUnits() + request.estimatedOutputUnits();

        if (entitlement == null || !entitlement.isEnabled()) {
            AiRequestAudit audit = saveUsageAudit(
                    tenant,
                    activeSchool,
                    actor,
                    request,
                    AiUsageStatus.DENIED,
                    "AI is not enabled for this tenant."
            );
            recordUsageDenied(actor, audit);
            throw new ForbiddenException("AI is not enabled for this tenant.");
        }
        if (!entitlement.getEnabledFeatures().contains(request.feature())) {
            AiRequestAudit audit = saveUsageAudit(
                    tenant,
                    activeSchool,
                    actor,
                    request,
                    AiUsageStatus.DENIED,
                    "AI feature is not enabled for this tenant."
            );
            recordUsageDenied(actor, audit);
            throw new ForbiddenException("AI feature is not enabled for this tenant.");
        }
        long usedThisMonth = unitsUsedThisMonth(tenant.getId());
        if (requestedUnits > Math.max(entitlement.getMonthlyUnitBudget() - usedThisMonth, 0)) {
            AiRequestAudit audit = saveUsageAudit(
                    tenant,
                    activeSchool,
                    actor,
                    request,
                    AiUsageStatus.DENIED,
                    "AI tenant monthly budget would be exceeded."
            );
            recordUsageDenied(actor, audit);
            throw new ConflictException("AI tenant monthly budget would be exceeded.");
        }

        AiRequestAudit audit = saveUsageAudit(
                tenant,
                activeSchool,
                actor,
                request,
                AiUsageStatus.AUTHORIZED,
                null
        );
        recordUsageAuthorized(actor, audit);
        return usageResponse(audit);
    }

    private UserAccount requireSuperAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can manage AI entitlements.");
        }
        return actor;
    }

    private Tenant tenant(String tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
    }

    private School activeSchool(AuthenticatedUser authenticatedUser, Tenant tenant) {
        if (authenticatedUser.activeSchoolId() == null || authenticatedUser.activeSchoolId().isBlank()) {
            return null;
        }
        School school = schoolRepository.findById(authenticatedUser.activeSchoolId())
                .orElseThrow(() -> new ForbiddenException("Active school is not valid."));
        if (!school.getTenant().getId().equals(tenant.getId())) {
            throw new ForbiddenException("Active school does not belong to the authenticated tenant.");
        }
        return school;
    }

    private Set<AiFeature> features(AiEntitlementRequest request) {
        if (request.enabledFeatures() == null || request.enabledFeatures().isEmpty()) {
            return EnumSet.noneOf(AiFeature.class);
        }
        return EnumSet.copyOf(request.enabledFeatures());
    }

    private AiRequestAudit saveUsageAudit(
            Tenant tenant,
            School school,
            UserAccount actor,
            AiUsageAuditRequest request,
            AiUsageStatus status,
            String denialReason
    ) {
        if (request.estimatedInputUnits() + request.estimatedOutputUnits() <= 0) {
            throw new BadRequestException("AI usage audit must include at least one estimated unit.");
        }
        AiRequestAudit audit = new AiRequestAudit(
                tenant,
                school,
                actor,
                request.feature(),
                request.scopeType(),
                request.scopeId(),
                request.requestType(),
                sha256(request.promptText()),
                request.promptText().length(),
                request.estimatedInputUnits(),
                request.estimatedOutputUnits(),
                request.estimatedCostCents(),
                status,
                denialReason
        );
        return aiRequestAuditRepository.save(audit);
    }

    private AiEntitlementResponse entitlementResponse(Tenant tenant, AiTenantEntitlement entitlement) {
        long used = unitsUsedThisMonth(tenant.getId());
        if (entitlement == null) {
            return new AiEntitlementResponse(
                    tenant.getId(),
                    false,
                    0,
                    used,
                    0,
                    List.of(),
                    true,
                    DEFAULT_RETENTION_DAYS,
                    null,
                    null
            );
        }
        long remaining = Math.max(entitlement.getMonthlyUnitBudget() - used, 0);
        return new AiEntitlementResponse(
                tenant.getId(),
                entitlement.isEnabled(),
                entitlement.getMonthlyUnitBudget(),
                used,
                remaining,
                entitlement.getEnabledFeatures().stream().sorted(Comparator.comparing(Enum::name)).toList(),
                entitlement.isHumanApprovalRequired(),
                entitlement.getRetentionDays(),
                entitlement.getUpdatedBy().getId(),
                entitlement.getUpdatedAt()
        );
    }

    private AiUsageAuditResponse usageResponse(AiRequestAudit audit) {
        return new AiUsageAuditResponse(
                audit.getId(),
                audit.getTenant().getId(),
                audit.getSchool() == null ? null : audit.getSchool().getId(),
                audit.getUser().getId(),
                audit.getUserRole().name(),
                audit.getFeature(),
                audit.getScopeType(),
                audit.getScopeId(),
                audit.getRequestType(),
                audit.getPromptSha256(),
                audit.getPromptLength(),
                audit.getEstimatedInputUnits(),
                audit.getEstimatedOutputUnits(),
                audit.getEstimatedCostCents(),
                audit.getStatus(),
                audit.getDenialReason(),
                audit.getCreatedAt()
        );
    }

    private long unitsUsedThisMonth(String tenantId) {
        Instant monthStart = Instant.now().atZone(ZoneOffset.UTC)
                .withDayOfMonth(1)
                .truncatedTo(ChronoUnit.DAYS)
                .toInstant();
        return aiRequestAuditRepository.sumAuthorizedUnitsSince(tenantId, monthStart);
    }

    private void recordEntitlementUpdated(UserAccount actor, AiTenantEntitlement entitlement) {
        auditLogService.record(
                entitlement.getTenant().getId(),
                null,
                actor.getRole().name(),
                actor.getId(),
                AuditAction.AI_ENTITLEMENT_UPDATED,
                "AiTenantEntitlement",
                entitlement.getTenant().getId(),
                "AI tenant entitlement updated by Super Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", entitlement.getTenant().getId(),
                        "enabled", entitlement.isEnabled(),
                        "monthlyUnitBudget", entitlement.getMonthlyUnitBudget(),
                        "enabledFeatures", entitlement.getEnabledFeatures().stream().map(AiFeature::name).sorted().toList(),
                        "humanApprovalRequired", entitlement.isHumanApprovalRequired(),
                        "retentionDays", entitlement.getRetentionDays()
                )
        );
    }

    private void recordUsageAuthorized(UserAccount actor, AiRequestAudit audit) {
        auditLogService.record(
                audit.getTenant().getId(),
                audit.getSchool() == null ? null : audit.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.AI_USAGE_AUDITED,
                "AiRequestAudit",
                audit.getId(),
                "AI usage audit recorded.",
                usageMetadata(audit)
        );
    }

    private void recordUsageDenied(UserAccount actor, AiRequestAudit audit) {
        auditLogService.record(
                audit.getTenant().getId(),
                audit.getSchool() == null ? null : audit.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.AI_USAGE_DENIED,
                "AiRequestAudit",
                audit.getId(),
                "AI usage request denied.",
                usageMetadata(audit)
        );
    }

    private Map<String, ?> usageMetadata(AiRequestAudit audit) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("tenantId", audit.getTenant().getId());
        metadata.put("schoolId", audit.getSchool() == null ? "" : audit.getSchool().getId());
        metadata.put("userId", audit.getUser().getId());
        metadata.put("role", audit.getUserRole().name());
        metadata.put("feature", audit.getFeature().name());
        metadata.put("scopeType", audit.getScopeType().name());
        metadata.put("scopeId", audit.getScopeId() == null ? "" : audit.getScopeId());
        metadata.put("requestType", audit.getRequestType());
        metadata.put("promptSha256", audit.getPromptSha256());
        metadata.put("promptLength", audit.getPromptLength());
        metadata.put("estimatedUnits", audit.getEstimatedInputUnits() + audit.getEstimatedOutputUnits());
        metadata.put("estimatedCostCents", audit.getEstimatedCostCents());
        metadata.put("status", audit.getStatus().name());
        metadata.put("denialReason", audit.getDenialReason() == null ? "" : audit.getDenialReason());
        return metadata;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }
}
