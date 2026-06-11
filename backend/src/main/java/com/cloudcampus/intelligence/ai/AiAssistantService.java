package com.cloudcampus.intelligence.ai;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.PageResponses;
import com.cloudcampus.identity.accesscontrol.guard.AuthorizationGuard;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiAssistantService {

    private static final String DISCLAIMER = "AI suggestions are drafts. Review before using them with students, parents, staff, or finance workflows.";

    private final boolean globalAiEnabled;
    private final AiProvider aiProvider;
    private final AiSafetyService aiSafetyService;
    private final AiFeatureCatalog aiFeatureCatalog;
    private final AiTenantEntitlementRepository aiTenantEntitlementRepository;
    private final AiRequestAuditRepository aiRequestAuditRepository;
    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final AuthorizationGuard authorizationGuard;
    private final AuditLogService auditLogService;

    public AiAssistantService(
            @Value("${cloudcampus.ai.enabled:true}") boolean globalAiEnabled,
            AiProvider aiProvider,
            AiSafetyService aiSafetyService,
            AiFeatureCatalog aiFeatureCatalog,
            AiTenantEntitlementRepository aiTenantEntitlementRepository,
            AiRequestAuditRepository aiRequestAuditRepository,
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            AuthorizationGuard authorizationGuard,
            AuditLogService auditLogService
    ) {
        this.globalAiEnabled = globalAiEnabled;
        this.aiProvider = aiProvider;
        this.aiSafetyService = aiSafetyService;
        this.aiFeatureCatalog = aiFeatureCatalog;
        this.aiTenantEntitlementRepository = aiTenantEntitlementRepository;
        this.aiRequestAuditRepository = aiRequestAuditRepository;
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.authorizationGuard = authorizationGuard;
        this.auditLogService = auditLogService;
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiAssistantResponse assistant(RequestContext context, AiAssistantQueryRequest request) {
        String prompt = aiSafetyService.requireSafePrompt(request.prompt(), "prompt");
        aiSafetyService.validateRoleSafety(context, prompt);
        AiFeature feature = aiFeatureCatalog.assistantFeature(context, request.module(), prompt);
        return generate(context, feature, "assistant_query", prompt, request.tone(), request.language(), List.of());
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiAssistantResponse notice(RequestContext context, AiNoticeGenerationRequest request) {
        String topic = aiSafetyService.requireSafePrompt(request.topic(), "topic");
        String details = aiSafetyService.optionalSafeText(request.details(), "details", 3000);
        String prompt = String.join("\n",
                "Topic: " + topic,
                "Audience: " + blankDefault(request.audience(), "school community"),
                "Channel: " + blankDefault(request.channel(), "notice"),
                "Details: " + details
        );
        return generate(context, AiFeature.NOTICE_DRAFTING, "notice_generation", prompt, request.tone(), request.language(), List.of());
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiAssistantResponse lessonPlan(RequestContext context, AiLessonPlanGenerationRequest request) {
        String prompt = academicPrompt(
                "Lesson plan",
                request.className(),
                request.section(),
                request.subject(),
                request.chapter(),
                request.difficulty(),
                request.boardType(),
                request.studentLevel(),
                request.durationMinutes(),
                request.instructions()
        );
        return generate(context, AiFeature.LESSON_PLAN_DRAFTING, "lesson_plan_generation", prompt, "clear", "English", List.of());
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiAssistantResponse homework(RequestContext context, AiHomeworkGenerationRequest request) {
        String prompt = academicPrompt(
                "Homework",
                request.className(),
                request.section(),
                request.subject(),
                request.chapter(),
                request.difficulty(),
                null,
                request.studentLevel(),
                null,
                request.instructions()
        );
        return generate(context, AiFeature.HOMEWORK_DRAFTING, "homework_generation", prompt, "clear", "English", List.of());
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiAssistantResponse quiz(RequestContext context, AiQuizGenerationRequest request) {
        String prompt = String.join("\n",
                academicPrompt(
                        "Quiz",
                        request.className(),
                        request.section(),
                        request.subject(),
                        request.chapter(),
                        request.difficulty(),
                        null,
                        null,
                        null,
                        request.instructions()
                ),
                "Question count: " + (request.questionCount() == null ? 5 : request.questionCount())
        );
        return generate(context, AiFeature.QUIZ_DRAFTING, "quiz_generation", prompt, "clear", "English", List.of());
    }

    @Transactional(noRollbackFor = ForbiddenException.class)
    public AiAssistantResponse reportSummary(RequestContext context, AiReportSummaryRequest request) {
        String reportText = aiSafetyService.requireSafePrompt(request.reportText(), "reportText");
        String prompt = String.join("\n",
                "Report type: " + aiSafetyService.optionalSafeText(request.reportType(), "reportType", 120),
                "Scope: " + aiSafetyService.optionalSafeText(request.reportScope(), "reportScope", 120),
                "Report text: " + reportText
        );
        return generate(context, AiFeature.REPORT_SUMMARY, "report_summary", prompt, request.tone(), request.language(), List.of());
    }

    @Transactional(readOnly = true)
    public AiPortalSettingsResponse settings(RequestContext context) {
        Tenant tenant = requireTenant(context);
        requireActiveSchoolForSchoolRoles(context);
        AiTenantEntitlement entitlement = aiTenantEntitlementRepository.findById(tenant.getId()).orElse(null);
        long used = unitsUsedThisMonth(tenant.getId());
        if (entitlement == null) {
            return new AiPortalSettingsResponse(
                    tenant.getId(),
                    schoolId(context),
                    false,
                    0,
                    used,
                    0,
                    List.of(),
                    true,
                    90,
                    aiFeatureCatalog.capabilities(context)
            );
        }
        long remaining = Math.max(entitlement.getMonthlyUnitBudget() - used, 0);
        return new AiPortalSettingsResponse(
                tenant.getId(),
                schoolId(context),
                entitlement.isEnabled(),
                entitlement.getMonthlyUnitBudget(),
                used,
                remaining,
                entitlement.getEnabledFeatures().stream().map(AiFeature::name).sorted().toList(),
                entitlement.isHumanApprovalRequired(),
                entitlement.getRetentionDays(),
                aiFeatureCatalog.capabilities(context)
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AiPortalAuditLogResponse> auditLogs(RequestContext context, int page, int size) {
        requireAuditLogAccess(context);
        List<AiPortalAuditLogResponse> rows = aiRequestAuditRepository.findByTenantIdOrderByCreatedAtDesc(context.tenantId().toString())
                .stream()
                .filter(audit -> canSeeAuditRow(context, audit))
                .sorted(Comparator.comparing(AiRequestAudit::getCreatedAt).reversed())
                .map(this::auditResponse)
                .toList();
        return PageResponses.of(rows, page, size);
    }

    private AiAssistantResponse generate(
            RequestContext context,
            AiFeature feature,
            String requestType,
            String prompt,
            String tone,
            String language,
            List<String> contextFacts
    ) {
        UserAccount actor = requireActor(context);
        Tenant tenant = requireTenant(context);
        School school = school(context);
        requireFeatureAllowed(context, feature);
        requireEntitled(context, actor, tenant, school, feature, requestType, prompt);

        String role = aiFeatureCatalog.primaryRole(context);
        AiProviderResponse providerResponse = aiProvider.generate(new AiProviderRequest(
                feature,
                requestType,
                role,
                aiSafetyService.safeTone(tone),
                aiSafetyService.safeLanguage(language),
                prompt,
                contextFacts(context, contextFacts),
                guardrails(context)
        ));
        AiRequestAudit audit = saveAudit(
                tenant,
                school,
                actor,
                feature,
                scopeType(context),
                scopeId(context),
                requestType,
                prompt,
                estimateInputUnits(prompt),
                providerResponse.estimatedOutputUnits(),
                0,
                AiUsageStatus.AUTHORIZED,
                null
        );
        audit(actor, audit, AuditAction.AI_USAGE_AUDITED, "AI generation request audited.");
        return new AiAssistantResponse(
                feature.name(),
                role,
                tenant.getId(),
                school == null ? null : school.getId(),
                providerResponse.answer(),
                providerResponse.highlights(),
                providerResponse.recommendedActions(),
                aiFeatureCatalog.quickActions(context, feature),
                DISCLAIMER,
                audit.getId(),
                providerResponse.provider(),
                providerResponse.model()
        );
    }

    private void requireFeatureAllowed(RequestContext context, AiFeature feature) {
        if (!globalAiEnabled) {
            throw new ForbiddenException("AI is disabled for this environment.");
        }
        if (!aiFeatureCatalog.isAllowed(context, feature)) {
            throw new ForbiddenException("This AI feature is not available for the current role.");
        }
        requireActiveSchoolForSchoolRoles(context);
    }

    private void requireActiveSchoolForSchoolRoles(RequestContext context) {
        if (aiFeatureCatalog.requiresActiveSchool(context)) {
            authorizationGuard.requireUserSchoolAccess(context, authorizationGuard.requireActiveSchool(context));
        }
    }

    private void requireEntitled(
            RequestContext context,
            UserAccount actor,
            Tenant tenant,
            School school,
            AiFeature feature,
            String requestType,
            String prompt
    ) {
        AiTenantEntitlement entitlement = aiTenantEntitlementRepository.findById(tenant.getId()).orElse(null);
        String denial = null;
        if (entitlement == null || !entitlement.isEnabled()) {
            denial = "AI is not enabled for this tenant.";
        } else if (!entitlement.getEnabledFeatures().contains(feature)) {
            denial = "AI feature is not enabled for this tenant.";
        } else if (estimateInputUnits(prompt) > Math.max(entitlement.getMonthlyUnitBudget() - unitsUsedThisMonth(tenant.getId()), 0)) {
            denial = "AI tenant monthly budget would be exceeded.";
        }
        if (denial == null) {
            return;
        }
        AiRequestAudit audit = saveAudit(
                tenant,
                school,
                actor,
                feature,
                scopeType(context),
                scopeId(context),
                requestType,
                prompt,
                estimateInputUnits(prompt),
                0,
                0,
                AiUsageStatus.DENIED,
                denial
        );
        audit(actor, audit, AuditAction.AI_USAGE_DENIED, "AI generation request denied.");
        throw new ForbiddenException(denial);
    }

    private String academicPrompt(
            String type,
            String className,
            String section,
            String subject,
            String chapter,
            String difficulty,
            String boardType,
            String studentLevel,
            Integer durationMinutes,
            String instructions
    ) {
        return String.join("\n",
                type + " request",
                "Class: " + aiSafetyService.requireSafePrompt(className, "className"),
                "Section: " + aiSafetyService.optionalSafeText(section, "section", 80),
                "Subject: " + aiSafetyService.requireSafePrompt(subject, "subject"),
                "Chapter: " + aiSafetyService.requireSafePrompt(chapter, "chapter"),
                "Difficulty: " + aiSafetyService.optionalSafeText(difficulty, "difficulty", 60),
                "Board: " + aiSafetyService.optionalSafeText(boardType, "boardType", 80),
                "Student level: " + aiSafetyService.optionalSafeText(studentLevel, "studentLevel", 40),
                "Duration minutes: " + (durationMinutes == null ? "" : durationMinutes),
                "Instructions: " + aiSafetyService.optionalSafeText(instructions, "instructions", 3000)
        );
    }

    private Tenant requireTenant(RequestContext context) {
        authorizationGuard.requireAuthenticated(context);
        return tenantRepository.findById(context.tenantId().toString())
                .orElseThrow(() -> new NotFoundException("Tenant was not found."));
    }

    private School school(RequestContext context) {
        if (context.activeSchoolId() == null) {
            return null;
        }
        return schoolRepository.findById(context.activeSchoolId().toString())
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private UserAccount requireActor(RequestContext context) {
        authorizationGuard.requireAuthenticated(context);
        return userAccountRepository.findById(context.userId().toString())
                .orElseThrow(() -> new NotFoundException("Authenticated user was not found."));
    }

    private AiRequestAudit saveAudit(
            Tenant tenant,
            School school,
            UserAccount actor,
            AiFeature feature,
            AiScopeType scopeType,
            String scopeId,
            String requestType,
            String prompt,
            long inputUnits,
            long outputUnits,
            long costCents,
            AiUsageStatus status,
            String denialReason
    ) {
        AiRequestAudit audit = new AiRequestAudit(
                tenant,
                school,
                actor,
                feature,
                scopeType,
                scopeId,
                requestType,
                sha256(prompt),
                prompt.length(),
                inputUnits,
                outputUnits,
                costCents,
                status,
                denialReason
        );
        return aiRequestAuditRepository.save(audit);
    }

    private void audit(UserAccount actor, AiRequestAudit audit, AuditAction action, String summary) {
        auditLogService.record(
                audit.getTenant().getId(),
                audit.getSchool() == null ? null : audit.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                "AiRequestAudit",
                audit.getId(),
                summary,
                Map.of(
                        "tenantId", audit.getTenant().getId(),
                        "schoolId", audit.getSchool() == null ? "" : audit.getSchool().getId(),
                        "userId", actor.getId(),
                        "role", actor.getRole().name(),
                        "feature", audit.getFeature().name(),
                        "requestType", audit.getRequestType(),
                        "promptSha256", audit.getPromptSha256(),
                        "promptLength", audit.getPromptLength(),
                        "status", audit.getStatus().name(),
                        "denialReason", audit.getDenialReason() == null ? "" : audit.getDenialReason()
                )
        );
    }

    private List<String> contextFacts(RequestContext context, List<String> suppliedFacts) {
        List<String> facts = new java.util.ArrayList<>();
        facts.add("Tenant scope is server-derived.");
        if (context.activeSchoolId() != null) {
            facts.add("Active school scope is " + context.activeSchoolId() + ".");
        }
        facts.addAll(suppliedFacts);
        return facts;
    }

    private List<String> guardrails(RequestContext context) {
        List<String> rows = new java.util.ArrayList<>();
        rows.add("Use only data allowed for role " + aiFeatureCatalog.primaryRole(context) + ".");
        rows.add("Do not expose secrets, tokens, or cross-tenant data.");
        if (context.hasRole("STUDENT")) {
            rows.add("Explain concepts step by step and avoid cheating assistance.");
        }
        return rows;
    }

    private long estimateInputUnits(String prompt) {
        return Math.max(1, prompt.length() / 4L);
    }

    private long unitsUsedThisMonth(String tenantId) {
        Instant monthStart = Instant.now().atZone(ZoneOffset.UTC)
                .withDayOfMonth(1)
                .truncatedTo(ChronoUnit.DAYS)
                .toInstant();
        return aiRequestAuditRepository.sumAuthorizedUnitsSince(tenantId, monthStart);
    }

    private void requireAuditLogAccess(RequestContext context) {
        if (context.hasRole("TENANT_ADMIN")) {
            return;
        }
        if (context.hasRole("SCHOOL_ADMIN") || context.hasRole("PRINCIPAL")) {
            authorizationGuard.requireUserSchoolAccess(context, authorizationGuard.requireActiveSchool(context));
            return;
        }
        throw new ForbiddenException("AI audit logs are available to tenant and school leadership only.");
    }

    private boolean canSeeAuditRow(RequestContext context, AiRequestAudit audit) {
        if (context.hasRole("TENANT_ADMIN")) {
            return true;
        }
        Set<String> schoolRoles = Set.of("SCHOOL_ADMIN", "PRINCIPAL");
        return context.roles().stream().anyMatch(schoolRoles::contains)
                && audit.getSchool() != null
                && context.activeSchoolId() != null
                && audit.getSchool().getId().equals(context.activeSchoolId().toString());
    }

    private AiPortalAuditLogResponse auditResponse(AiRequestAudit audit) {
        return new AiPortalAuditLogResponse(
                audit.getId(),
                audit.getTenant().getId(),
                audit.getSchool() == null ? null : audit.getSchool().getId(),
                audit.getUser().getId(),
                audit.getUserRole().name(),
                audit.getFeature().name(),
                audit.getScopeType().name(),
                audit.getScopeId(),
                audit.getRequestType(),
                audit.getPromptSha256(),
                audit.getPromptLength(),
                audit.getEstimatedInputUnits() + audit.getEstimatedOutputUnits(),
                audit.getEstimatedCostCents(),
                audit.getStatus().name(),
                audit.getDenialReason(),
                audit.getCreatedAt()
        );
    }

    private AiScopeType scopeType(RequestContext context) {
        if (context.activeSchoolId() != null) {
            return AiScopeType.SCHOOL;
        }
        return AiScopeType.TENANT;
    }

    private String scopeId(RequestContext context) {
        if (context.activeSchoolId() != null) {
            return context.activeSchoolId().toString();
        }
        return context.tenantId().toString();
    }

    private String schoolId(RequestContext context) {
        return context.activeSchoolId() == null ? null : context.activeSchoolId().toString();
    }

    private String blankDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 digest is not available.", ex);
        }
    }
}
