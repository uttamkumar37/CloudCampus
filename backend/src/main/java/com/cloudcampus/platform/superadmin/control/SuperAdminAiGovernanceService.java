package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.intelligence.ai.AiPolicy;
import com.cloudcampus.intelligence.ai.AiPolicyRepository;
import com.cloudcampus.intelligence.ai.AiRecommendation;
import com.cloudcampus.intelligence.ai.AiRecommendationRepository;
import com.cloudcampus.intelligence.ai.AiRecommendationRiskLevel;
import com.cloudcampus.intelligence.ai.AiRecommendationStatus;
import com.cloudcampus.intelligence.ai.AiRecommendationType;
import com.cloudcampus.intelligence.ai.AiRequestAudit;
import com.cloudcampus.intelligence.ai.AiRequestAuditRepository;
import com.cloudcampus.intelligence.ai.AutomationRule;
import com.cloudcampus.intelligence.ai.AutomationRuleRepository;
import com.cloudcampus.intelligence.ai.AutomationRun;
import com.cloudcampus.intelligence.ai.AutomationRunRepository;
import com.cloudcampus.intelligence.ai.AutomationRunStatus;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuperAdminAiGovernanceService {

    private static final int MAX_PAGE_SIZE = 100;

    private final AiRecommendationRepository aiRecommendationRepository;
    private final AutomationRuleRepository automationRuleRepository;
    private final AutomationRunRepository automationRunRepository;
    private final AiPolicyRepository aiPolicyRepository;
    private final AiRequestAuditRepository aiRequestAuditRepository;
    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final AuditLogService auditLogService;

    public SuperAdminAiGovernanceService(
            AiRecommendationRepository aiRecommendationRepository,
            AutomationRuleRepository automationRuleRepository,
            AutomationRunRepository automationRunRepository,
            AiPolicyRepository aiPolicyRepository,
            AiRequestAuditRepository aiRequestAuditRepository,
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            AuditLogService auditLogService
    ) {
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.automationRuleRepository = automationRuleRepository;
        this.automationRunRepository = automationRunRepository;
        this.aiPolicyRepository = aiPolicyRepository;
        this.aiRequestAuditRepository = aiRequestAuditRepository;
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAiRecommendationResponse> recommendations(
            AuthenticatedUser actor,
            int page,
            int size,
            String tenantId,
            String schoolId,
            AiRecommendationType type,
            AiRecommendationStatus status,
            AiRecommendationRiskLevel riskLevel,
            String assignedTo
    ) {
        requireSuperAdmin(actor);
        Page<AiRecommendation> source = aiRecommendationRepository.findAll(
                recommendationSpec(tenantId, schoolId, type, status, riskLevel, assignedTo),
                pageable(page, size)
        );
        return page(source, source.getContent().stream().map(this::recommendationResponse).toList());
    }

    @Transactional
    public SuperAdminAiRecommendationResponse recommendation(AuthenticatedUser actor, String id) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        AiRecommendation recommendation = requireRecommendation(id);
        audit(superAdmin, recommendation.getSchool() == null ? null : recommendation.getSchool().getId(), AuditAction.AI_RECOMMENDATION_VIEWED,
                "AiRecommendation", recommendation.getId(), "AI recommendation viewed by Super Admin.",
                Map.of("recommendationId", recommendation.getId(), "status", recommendation.getStatus().name()));
        return recommendationResponse(recommendation);
    }

    @Transactional
    public SuperAdminAiRecommendationResponse createRecommendation(AuthenticatedUser actor, AiRecommendationCreateRequest request) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        Tenant tenant = requireTenant(normalizeRequired(request.tenantId(), "Tenant is required."));
        School school = resolveSchool(request.schoolId(), tenant);
        UserAccount assignedTo = resolveUser(request.assignedToUserId());
        AiRequestAudit sourceAudit = request.sourceUsageAuditId() == null || request.sourceUsageAuditId().isBlank()
                ? null
                : aiRequestAuditRepository.findById(request.sourceUsageAuditId())
                .orElseThrow(() -> new NotFoundException("AI usage audit was not found."));
        AiRecommendation recommendation = aiRecommendationRepository.save(new AiRecommendation(
                tenant,
                school,
                blankDefault(request.targetType(), "GENERAL"),
                blankToNull(request.targetId()),
                request.recommendationType() == null ? AiRecommendationType.PLATFORM_HEALTH_INSIGHT : request.recommendationType(),
                normalizeRequired(request.title(), "Recommendation title is required."),
                normalizeRequired(request.summary(), "Recommendation summary is required."),
                blankToNull(request.rationale()),
                request.confidenceScore(),
                request.riskLevel() == null ? AiRecommendationRiskLevel.MEDIUM : request.riskLevel(),
                request.status() == null ? AiRecommendationStatus.PENDING_REVIEW : request.status(),
                blankDefault(request.createdByActorType(), "AI_AGENT"),
                blankToNull(request.createdByActorId()),
                assignedTo,
                request.approvalRequired() != Boolean.FALSE,
                request.expiresAt(),
                sourceAudit,
                sanitizeJson(request.metadataJson())
        ));
        audit(
                superAdmin,
                school == null ? null : school.getId(),
                AuditAction.AI_RECOMMENDATION_CREATED,
                "AiRecommendation",
                recommendation.getId(),
                "AI recommendation created.",
                Map.of(
                        "recommendationId", recommendation.getId(),
                        "createdByActorType", recommendation.getCreatedByActorType(),
                        "recommendationType", recommendation.getRecommendationType().name(),
                        "riskLevel", recommendation.getRiskLevel().name()
                )
        );
        return recommendationResponse(recommendation);
    }

    @Transactional
    public SuperAdminAiRecommendationResponse approve(AuthenticatedUser actor, String id) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        AiRecommendation recommendation = requireRecommendation(id);
        ensureRecommendationOpen(recommendation);
        recommendation.approve(superAdmin, Instant.now());
        audit(superAdmin, schoolId(recommendation), AuditAction.AI_RECOMMENDATION_APPROVED,
                "AiRecommendation", recommendation.getId(), "AI recommendation approved.",
                Map.of("recommendationId", recommendation.getId(), "riskLevel", recommendation.getRiskLevel().name()));
        return recommendationResponse(recommendation);
    }

    @Transactional
    public SuperAdminAiRecommendationResponse reject(AuthenticatedUser actor, String id, AiRecommendationDecisionRequest request) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        AiRecommendation recommendation = requireRecommendation(id);
        ensureRecommendationOpen(recommendation);
        String reason = normalizeRequired(request == null ? null : request.reason(), "Rejection reason is required.");
        recommendation.reject(superAdmin, reason, Instant.now());
        audit(superAdmin, schoolId(recommendation), AuditAction.AI_RECOMMENDATION_REJECTED,
                "AiRecommendation", recommendation.getId(), "AI recommendation rejected.",
                Map.of("recommendationId", recommendation.getId(), "reason", reason));
        return recommendationResponse(recommendation);
    }

    @Transactional
    public SuperAdminAiRecommendationResponse execute(AuthenticatedUser actor, String id) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        AiRecommendation recommendation = requireRecommendation(id);
        if (recommendation.getExpiresAt() != null && !recommendation.getExpiresAt().isAfter(Instant.now())) {
            recommendation.fail("Recommendation expired before execution.");
            audit(superAdmin, schoolId(recommendation), AuditAction.AI_RECOMMENDATION_EXPIRED,
                    "AiRecommendation", recommendation.getId(), "AI recommendation expired before execution.",
                    Map.of("recommendationId", recommendation.getId()));
            throw new BadRequestException("Expired AI recommendations cannot be executed.");
        }
        if (recommendation.getStatus() != AiRecommendationStatus.APPROVED) {
            throw new BadRequestException("Only approved AI recommendations can be executed.");
        }
        recommendation.execute("SYSTEM", null, Instant.now());
        audit(superAdmin, schoolId(recommendation), AuditAction.AI_RECOMMENDATION_EXECUTED,
                "AiRecommendation", recommendation.getId(), "Approved AI recommendation executed by SYSTEM.",
                Map.of("recommendationId", recommendation.getId(), "executedByActorType", "SYSTEM"));
        return recommendationResponse(recommendation);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAutomationRuleResponse> automationRules(
            AuthenticatedUser actor,
            int page,
            int size,
            String tenantId,
            String schoolId,
            Boolean enabled
    ) {
        requireSuperAdmin(actor);
        Page<AutomationRule> rules = automationRuleRepository.findAll(automationRuleSpec(tenantId, schoolId, enabled), pageable(page, size));
        return page(rules, rules.getContent().stream().map(this::automationRuleResponse).toList());
    }

    @Transactional
    public SuperAdminAutomationRuleResponse createAutomationRule(AuthenticatedUser actor, AutomationRuleRequest request) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        Tenant tenant = request.tenantId() == null || request.tenantId().isBlank() ? null : requireTenant(request.tenantId());
        School school = resolveSchool(request.schoolId(), tenant);
        AutomationRule rule = automationRuleRepository.save(new AutomationRule(
                tenant,
                school,
                normalizeRequired(request.code(), "Automation rule code is required.").toUpperCase(Locale.ROOT),
                normalizeRequired(request.name(), "Automation rule name is required."),
                blankToNull(request.description()),
                normalizeRequired(request.triggerType(), "Trigger type is required."),
                sanitizeJson(request.triggerConfigJson()),
                normalizeRequired(request.actionType(), "Action type is required."),
                sanitizeJson(request.actionConfigJson()),
                request.enabled() == Boolean.TRUE,
                request.requiresApproval() != Boolean.FALSE,
                request.approvalRole(),
                request.riskLevel() == null ? AiRecommendationRiskLevel.MEDIUM : request.riskLevel(),
                superAdmin
        ));
        audit(superAdmin, school == null ? null : school.getId(), AuditAction.AUTOMATION_RULE_CREATED,
                "AutomationRule", rule.getId(), "Automation rule created.",
                Map.of("ruleId", rule.getId(), "code", rule.getCode(), "enabled", rule.isEnabled()));
        return automationRuleResponse(rule);
    }

    @Transactional
    public SuperAdminAutomationRuleResponse updateAutomationRule(AuthenticatedUser actor, String ruleId, AutomationRuleUpdateRequest request) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        AutomationRule rule = automationRuleRepository.findById(ruleId)
                .orElseThrow(() -> new NotFoundException("Automation rule was not found."));
        boolean wasEnabled = rule.isEnabled();
        rule.update(request.name(), request.description(), request.enabled(), request.requiresApproval(), request.approvalRole(), request.riskLevel(), superAdmin);
        AuditAction action = wasEnabled != rule.isEnabled()
                ? (rule.isEnabled() ? AuditAction.AUTOMATION_RULE_ENABLED : AuditAction.AUTOMATION_RULE_DISABLED)
                : AuditAction.AUTOMATION_RULE_UPDATED;
        audit(superAdmin, rule.getSchool() == null ? null : rule.getSchool().getId(), action,
                "AutomationRule", rule.getId(), "Automation rule updated.",
                Map.of("ruleId", rule.getId(), "enabled", rule.isEnabled()));
        return automationRuleResponse(rule);
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAutomationRunResponse> automationRuns(
            AuthenticatedUser actor,
            int page,
            int size,
            String tenantId,
            String schoolId,
            AutomationRunStatus status
    ) {
        requireSuperAdmin(actor);
        Page<AutomationRun> runs = automationRunRepository.findAll(automationRunSpec(tenantId, schoolId, status), pageable(page, size));
        return page(runs, runs.getContent().stream().map(this::automationRunResponse).toList());
    }

    @Transactional(readOnly = true)
    public SuperAdminPageResponse<SuperAdminAiPolicyResponse> policies(AuthenticatedUser actor, int page, int size, String tenantId) {
        requireSuperAdmin(actor);
        Page<AiPolicy> policies = aiPolicyRepository.findAll(policySpec(tenantId), pageable(page, size));
        return page(policies, policies.getContent().stream().map(this::policyResponse).toList());
    }

    @Transactional(readOnly = true)
    public SuperAdminAiPolicyResponse policy(AuthenticatedUser actor, String tenantId) {
        requireSuperAdmin(actor);
        AiPolicy policy = aiPolicyRepository.findByTenantIdAndSchoolIsNull(tenantId)
                .orElseThrow(() -> new NotFoundException("AI policy was not found for this tenant."));
        return policyResponse(policy);
    }

    @Transactional
    public SuperAdminAiPolicyResponse updatePolicy(AuthenticatedUser actor, String tenantId, AiPolicyUpdateRequest request) {
        UserAccount superAdmin = requireSuperAdmin(actor);
        Tenant tenant = requireTenant(tenantId);
        School school = resolveSchool(request == null ? null : request.schoolId(), tenant);
        AiPolicy policy = school == null
                ? aiPolicyRepository.findByTenantIdAndSchoolIsNull(tenantId).orElse(null)
                : aiPolicyRepository.findByTenantIdAndSchoolId(tenantId, school.getId()).orElse(null);
        if (policy == null) {
            policy = new AiPolicy(
                    tenant,
                    school,
                    request.enabled() != Boolean.FALSE,
                    blankDefault(request.allowedFeaturesJson(), "[]"),
                    request.monthlyBudgetUnits() == null ? 0 : request.monthlyBudgetUnits(),
                    request.humanApprovalRequiredDefault() != Boolean.FALSE,
                    request.allowLowRiskAutoPublish() == Boolean.TRUE,
                    request.allowFeeReminderAutoSend() == Boolean.TRUE,
                    request.allowParentMessageAutoSend() == Boolean.TRUE,
                    request.retentionDays() == null ? 90 : request.retentionDays(),
                    superAdmin
            );
        } else {
            policy.update(
                    request.enabled() == null ? policy.isEnabled() : request.enabled(),
                    blankDefault(request.allowedFeaturesJson(), policy.getAllowedFeaturesJson()),
                    request.monthlyBudgetUnits() == null ? policy.getMonthlyBudgetUnits() : request.monthlyBudgetUnits(),
                    request.humanApprovalRequiredDefault() == null ? policy.isHumanApprovalRequiredDefault() : request.humanApprovalRequiredDefault(),
                    request.allowLowRiskAutoPublish() == null ? policy.isAllowLowRiskAutoPublish() : request.allowLowRiskAutoPublish(),
                    request.allowFeeReminderAutoSend() == null ? policy.isAllowFeeReminderAutoSend() : request.allowFeeReminderAutoSend(),
                    request.allowParentMessageAutoSend() == null ? policy.isAllowParentMessageAutoSend() : request.allowParentMessageAutoSend(),
                    request.retentionDays() == null ? policy.getRetentionDays() : request.retentionDays(),
                    superAdmin
            );
        }
        AiPolicy saved = aiPolicyRepository.save(policy);
        audit(superAdmin, school == null ? null : school.getId(), AuditAction.AI_POLICY_UPDATED,
                "AiPolicy", saved.getId(), "AI policy updated.",
                Map.of(
                        "tenantId", tenantId,
                        "schoolId", school == null ? "" : school.getId(),
                        "monthlyBudgetUnits", saved.getMonthlyBudgetUnits(),
                        "enabled", saved.isEnabled()
                ));
        return policyResponse(saved);
    }

    private Specification<AiRecommendation> recommendationSpec(
            String tenantId,
            String schoolId,
            AiRecommendationType type,
            AiRecommendationStatus status,
            AiRecommendationRiskLevel riskLevel,
            String assignedTo
    ) {
        String normalizedTenantId = blankToNull(tenantId);
        String normalizedSchoolId = blankToNull(schoolId);
        String normalizedAssignedTo = blankToNull(assignedTo);
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (normalizedTenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), normalizedTenantId));
            }
            if (normalizedSchoolId != null) {
                predicates.add(criteriaBuilder.equal(root.get("school").get("id"), normalizedSchoolId));
            }
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("recommendationType"), type));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (riskLevel != null) {
                predicates.add(criteriaBuilder.equal(root.get("riskLevel"), riskLevel));
            }
            if (normalizedAssignedTo != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignedTo").get("id"), normalizedAssignedTo));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<AutomationRule> automationRuleSpec(String tenantId, String schoolId, Boolean enabled) {
        String normalizedTenantId = blankToNull(tenantId);
        String normalizedSchoolId = blankToNull(schoolId);
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (normalizedTenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), normalizedTenantId));
            }
            if (normalizedSchoolId != null) {
                predicates.add(criteriaBuilder.equal(root.get("school").get("id"), normalizedSchoolId));
            }
            if (enabled != null) {
                predicates.add(criteriaBuilder.equal(root.get("enabled"), enabled));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<AutomationRun> automationRunSpec(String tenantId, String schoolId, AutomationRunStatus status) {
        String normalizedTenantId = blankToNull(tenantId);
        String normalizedSchoolId = blankToNull(schoolId);
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (normalizedTenantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), normalizedTenantId));
            }
            if (normalizedSchoolId != null) {
                predicates.add(criteriaBuilder.equal(root.get("school").get("id"), normalizedSchoolId));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<AiPolicy> policySpec(String tenantId) {
        String normalizedTenantId = blankToNull(tenantId);
        return (root, query, criteriaBuilder) -> normalizedTenantId == null
                ? criteriaBuilder.conjunction()
                : criteriaBuilder.equal(root.get("tenant").get("id"), normalizedTenantId);
    }

    private SuperAdminAiRecommendationResponse recommendationResponse(AiRecommendation recommendation) {
        return new SuperAdminAiRecommendationResponse(
                recommendation.getId(),
                recommendation.getTenant().getId(),
                recommendation.getTenant().getName(),
                recommendation.getSchool() == null ? null : recommendation.getSchool().getId(),
                recommendation.getSchool() == null ? null : recommendation.getSchool().getName(),
                recommendation.getTargetType(),
                recommendation.getTargetId(),
                recommendation.getRecommendationType().name(),
                recommendation.getTitle(),
                recommendation.getSummary(),
                recommendation.getRationale(),
                recommendation.getConfidenceScore(),
                recommendation.getRiskLevel().name(),
                recommendation.getStatus().name(),
                recommendation.getCreatedByActorType(),
                recommendation.getCreatedByActorId(),
                recommendation.getAssignedTo() == null ? null : recommendation.getAssignedTo().getId(),
                recommendation.getAssignedTo() == null ? null : recommendation.getAssignedTo().getDisplayName(),
                recommendation.isApprovalRequired(),
                recommendation.getApprovedBy() == null ? null : recommendation.getApprovedBy().getId(),
                recommendation.getApprovedAt(),
                recommendation.getRejectedBy() == null ? null : recommendation.getRejectedBy().getId(),
                recommendation.getRejectedAt(),
                recommendation.getRejectionReason(),
                recommendation.getExecutedAt(),
                recommendation.getFailureReason(),
                recommendation.getExpiresAt(),
                recommendation.getSourceUsageAudit() == null ? null : recommendation.getSourceUsageAudit().getId(),
                sanitizeJson(recommendation.getMetadataJson()),
                recommendation.getCreatedAt()
        );
    }

    private SuperAdminAutomationRuleResponse automationRuleResponse(AutomationRule rule) {
        return new SuperAdminAutomationRuleResponse(
                rule.getId(),
                rule.getTenant() == null ? null : rule.getTenant().getId(),
                rule.getTenant() == null ? null : rule.getTenant().getName(),
                rule.getSchool() == null ? null : rule.getSchool().getId(),
                rule.getSchool() == null ? null : rule.getSchool().getName(),
                rule.getCode(),
                rule.getName(),
                rule.getDescription(),
                rule.getTriggerType(),
                rule.getActionType(),
                rule.isEnabled(),
                rule.isRequiresApproval(),
                rule.getApprovalRole() == null ? null : rule.getApprovalRole().name(),
                rule.getRiskLevel().name(),
                rule.getCreatedAt()
        );
    }

    private SuperAdminAutomationRunResponse automationRunResponse(AutomationRun run) {
        return new SuperAdminAutomationRunResponse(
                run.getId(),
                run.getAutomationRule().getId(),
                run.getAutomationRule().getName(),
                run.getTenant() == null ? null : run.getTenant().getId(),
                run.getTenant() == null ? null : run.getTenant().getName(),
                run.getSchool() == null ? null : run.getSchool().getId(),
                run.getSchool() == null ? null : run.getSchool().getName(),
                run.getStatus().name(),
                run.getTriggeredByActorType(),
                sanitizeJson(run.getInputSummaryJson()),
                sanitizeJson(run.getOutputSummaryJson()),
                safeText(run.getErrorMessage()),
                run.getStartedAt(),
                run.getCompletedAt()
        );
    }

    private SuperAdminAiPolicyResponse policyResponse(AiPolicy policy) {
        return new SuperAdminAiPolicyResponse(
                policy.getId(),
                policy.getTenant().getId(),
                policy.getTenant().getName(),
                policy.getSchool() == null ? null : policy.getSchool().getId(),
                policy.getSchool() == null ? null : policy.getSchool().getName(),
                policy.isEnabled(),
                sanitizeJson(policy.getAllowedFeaturesJson()),
                policy.getMonthlyBudgetUnits(),
                policy.isHumanApprovalRequiredDefault(),
                policy.isAllowLowRiskAutoPublish(),
                policy.isAllowFeeReminderAutoSend(),
                policy.isAllowParentMessageAutoSend(),
                policy.getRetentionDays(),
                policy.getUpdatedAt()
        );
    }

    private void ensureRecommendationOpen(AiRecommendation recommendation) {
        if (recommendation.getExpiresAt() != null && !recommendation.getExpiresAt().isAfter(Instant.now())) {
            throw new BadRequestException("Expired AI recommendations cannot be changed.");
        }
        if (recommendation.getStatus() == AiRecommendationStatus.EXECUTED
                || recommendation.getStatus() == AiRecommendationStatus.REJECTED
                || recommendation.getStatus() == AiRecommendationStatus.CANCELLED
                || recommendation.getStatus() == AiRecommendationStatus.FAILED
                || recommendation.getStatus() == AiRecommendationStatus.EXPIRED) {
            throw new BadRequestException("AI recommendation is no longer pending review.");
        }
    }

    private UserAccount requireSuperAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can access AI governance APIs.");
        }
        return actor;
    }

    private AiRecommendation requireRecommendation(String id) {
        return aiRecommendationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AI recommendation was not found."));
    }

    private Tenant requireTenant(String tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
    }

    private School resolveSchool(String schoolId, Tenant tenant) {
        if (schoolId == null || schoolId.isBlank()) {
            return null;
        }
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found."));
        if (tenant != null && !school.getTenant().getId().equals(tenant.getId())) {
            throw new BadRequestException("School must belong to the selected tenant.");
        }
        return school;
    }

    private UserAccount resolveUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Assigned user was not found."));
    }

    private Pageable pageable(int page, int size) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private <S, T> SuperAdminPageResponse<T> page(Page<S> source, List<T> items) {
        return new SuperAdminPageResponse<>(items, source.getNumber(), source.getSize(), source.getTotalElements(), source.getTotalPages());
    }

    private void audit(UserAccount actor, String schoolId, AuditAction action, String entityType, String entityId, String summary, Map<String, ?> metadata) {
        auditLogService.record(actor.getTenant().getId(), schoolId, actor.getRole().name(), actor.getId(), action, entityType, entityId, summary, metadata);
    }

    private String schoolId(AiRecommendation recommendation) {
        return recommendation.getSchool() == null ? null : recommendation.getSchool().getId();
    }

    private String sanitizeJson(String value) {
        if (value == null || value.isBlank()) {
            return "{}";
        }
        return value
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

    private String safeText(String value) {
        if (value == null) {
            return null;
        }
        return sanitizeJson("{\"message\":\"" + value.replace("\"", "'") + "\"}");
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private String blankDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
