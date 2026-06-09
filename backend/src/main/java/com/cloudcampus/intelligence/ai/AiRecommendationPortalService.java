package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.PageResponses;
import com.cloudcampus.identity.accesscontrol.AuthorizationService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiRecommendationPortalService {

    private final AiRecommendationRepository aiRecommendationRepository;
    private final AutomationRuleRepository automationRuleRepository;
    private final AutomationRunRepository automationRunRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public AiRecommendationPortalService(
            AiRecommendationRepository aiRecommendationRepository,
            AutomationRuleRepository automationRuleRepository,
            AutomationRunRepository automationRunRepository,
            AuthorizationService authorizationService,
            AuditLogService auditLogService
    ) {
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.automationRuleRepository = automationRuleRepository;
        this.automationRunRepository = automationRunRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AiRecommendationPortalResponse> recommendations(AuthenticatedUser actor, int page, int size) {
        denyPublicAiAccess(actor.user());
        List<AiRecommendationPortalResponse> rows = aiRecommendationRepository.findAll().stream()
                .filter(recommendation -> canAccess(actor, recommendation))
                .sorted(Comparator.comparing(AiRecommendation::getCreatedAt).reversed())
                .map(this::response)
                .toList();
        return PageResponses.of(rows, page, size);
    }

    @Transactional(readOnly = true)
    public AiRecommendationPortalResponse recommendation(AuthenticatedUser actor, String id) {
        denyPublicAiAccess(actor.user());
        AiRecommendation recommendation = requireRecommendation(id);
        if (!canAccess(actor, recommendation)) {
            throw new ForbiddenException("User cannot access this AI recommendation.");
        }
        return response(recommendation);
    }

    @Transactional
    public AiRecommendationPortalResponse approve(AuthenticatedUser actor, String id) {
        AiRecommendation recommendation = requireMutableRecommendation(actor, id);
        if (!authorizationService.canApproveAiRecommendation(
                actor.user(),
                recommendation.getTenant().getId(),
                recommendation.getSchool() == null ? null : recommendation.getSchool().getId(),
                recommendation.getRiskLevel().name()
        )) {
            throw new ForbiddenException("User cannot approve this AI recommendation.");
        }
        recommendation.approve(actor.user(), Instant.now());
        audit(actor.user(), recommendation, AuditAction.AI_RECOMMENDATION_APPROVED, "AI recommendation approved from scoped portal.");
        return response(recommendation);
    }

    @Transactional
    public AiRecommendationPortalResponse reject(AuthenticatedUser actor, String id, AiRecommendationRejectRequest request) {
        AiRecommendation recommendation = requireMutableRecommendation(actor, id);
        String reason = request == null || request.reason() == null || request.reason().isBlank()
                ? "Rejected from scoped AI portal."
                : request.reason().trim();
        recommendation.reject(actor.user(), reason, Instant.now());
        audit(actor.user(), recommendation, AuditAction.AI_RECOMMENDATION_REJECTED, "AI recommendation rejected from scoped portal.");
        return response(recommendation);
    }

    @Transactional
    public AiRecommendationPortalResponse accept(AuthenticatedUser actor, String id) {
        AiRecommendation recommendation = requireMutableRecommendation(actor, id);
        if (recommendation.isApprovalRequired() && recommendation.getRiskLevel() != AiRecommendationRiskLevel.LOW) {
            throw new BadRequestException("This recommendation requires formal approval.");
        }
        recommendation.approve(actor.user(), Instant.now());
        audit(actor.user(), recommendation, AuditAction.AI_RECOMMENDATION_APPROVED, "Low-risk AI recommendation accepted.");
        return response(recommendation);
    }

    @Transactional
    public AiRecommendationPortalResponse execute(AuthenticatedUser actor, String id) {
        AiRecommendation recommendation = requireMutableRecommendation(actor, id);
        if (recommendation.getStatus() != AiRecommendationStatus.APPROVED) {
            throw new BadRequestException("Only approved AI recommendations can be executed.");
        }
        if (!authorizationService.canRunAutomation(
                actor.user(),
                recommendation.getTenant().getId(),
                recommendation.getSchool() == null ? null : recommendation.getSchool().getId()
        )) {
            throw new ForbiddenException("User cannot execute this AI recommendation.");
        }
        recommendation.execute(actor.user().getRole().name(), actor.user().getId(), Instant.now());
        audit(actor.user(), recommendation, AuditAction.AI_RECOMMENDATION_EXECUTED, "AI recommendation executed from scoped portal.");
        return response(recommendation);
    }

    @Transactional
    public AiRecommendationPortalResponse dismiss(AuthenticatedUser actor, String id) {
        AiRecommendation recommendation = requireMutableRecommendation(actor, id);
        recommendation.cancel();
        audit(actor.user(), recommendation, AuditAction.AI_RECOMMENDATION_DISMISSED, "AI recommendation dismissed from scoped portal.");
        return response(recommendation);
    }

    @Transactional(readOnly = true)
    public PageResponse<AiAutomationRulePortalResponse> automationRules(AuthenticatedUser actor, int page, int size) {
        denyRestrictedAutomation(actor.user());
        List<AiAutomationRulePortalResponse> rows = automationRuleRepository.findAll().stream()
                .filter(rule -> rule.getTenant() == null || authorizationService.canAccessTenant(actor.user(), rule.getTenant().getId()))
                .filter(rule -> rule.getSchool() == null || authorizationService.canAccessSchool(actor.user(), rule.getSchool().getId()))
                .sorted(Comparator.comparing(AutomationRule::getCreatedAt).reversed())
                .map(rule -> new AiAutomationRulePortalResponse(
                        rule.getId(),
                        rule.getCode(),
                        rule.getName(),
                        rule.getDescription(),
                        rule.getTriggerType(),
                        rule.getActionType(),
                        rule.isEnabled(),
                        rule.isRequiresApproval(),
                        rule.getApprovalRole() == null ? null : rule.getApprovalRole().name(),
                        rule.getRiskLevel().name()
                ))
                .toList();
        return PageResponses.of(rows, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AiAutomationRunPortalResponse> automationRuns(AuthenticatedUser actor, int page, int size) {
        denyRestrictedAutomation(actor.user());
        List<AiAutomationRunPortalResponse> rows = automationRunRepository.findAll().stream()
                .filter(run -> run.getTenant() == null || authorizationService.canAccessTenant(actor.user(), run.getTenant().getId()))
                .filter(run -> run.getSchool() == null || authorizationService.canAccessSchool(actor.user(), run.getSchool().getId()))
                .sorted(Comparator.comparing(AutomationRun::getStartedAt).reversed())
                .map(run -> new AiAutomationRunPortalResponse(
                        run.getId(),
                        run.getAutomationRule().getId(),
                        run.getStatus().name(),
                        run.getTriggeredByActorType(),
                        sanitizeJson(run.getInputSummaryJson()),
                        sanitizeJson(run.getOutputSummaryJson()),
                        run.getErrorMessage(),
                        run.getStartedAt(),
                        run.getCompletedAt()
                ))
                .toList();
        return PageResponses.of(rows, page, size);
    }

    private AiRecommendation requireMutableRecommendation(AuthenticatedUser actor, String id) {
        UserAccount user = actor.user();
        denyPublicAiAccess(user);
        if (user.getRole() == UserRole.PARENT) {
            throw new ForbiddenException("Parents can only view approved child AI recommendations.");
        }
        if (user.getRole() == UserRole.OFFICE_STAFF || user.getRole() == UserRole.STAFF) {
            throw new ForbiddenException("Office staff can only view approved office AI follow-ups.");
        }
        AiRecommendation recommendation = requireRecommendation(id);
        if (!canAccess(actor, recommendation)) {
            throw new ForbiddenException("User cannot access this AI recommendation.");
        }
        if (recommendation.getExpiresAt() != null && !recommendation.getExpiresAt().isAfter(Instant.now())) {
            throw new BadRequestException("Expired AI recommendations cannot be changed.");
        }
        if (recommendation.getStatus() == AiRecommendationStatus.EXECUTED
                || recommendation.getStatus() == AiRecommendationStatus.REJECTED
                || recommendation.getStatus() == AiRecommendationStatus.CANCELLED
                || recommendation.getStatus() == AiRecommendationStatus.FAILED
                || recommendation.getStatus() == AiRecommendationStatus.EXPIRED) {
            throw new BadRequestException("AI recommendation is no longer pending.");
        }
        return recommendation;
    }

    private AiRecommendation requireRecommendation(String id) {
        return aiRecommendationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AI recommendation was not found."));
    }

    private boolean canAccess(AuthenticatedUser actor, AiRecommendation recommendation) {
        return canAccess(actor.user(), actor.activeSchoolId(), recommendation);
    }

    private boolean canAccess(UserAccount user, AiRecommendation recommendation) {
        return canAccess(user, null, recommendation);
    }

    private boolean canAccess(UserAccount user, String activeSchoolId, AiRecommendation recommendation) {
        if (!authorizationService.canAccessTenant(user, recommendation.getTenant().getId())) {
            return false;
        }
        if (recommendation.getSchool() != null && !authorizationService.canAccessSchool(user, recommendation.getSchool().getId())) {
            return false;
        }
        if (user.getRole() == UserRole.PARENT) {
            if (activeSchoolId == null || activeSchoolId.isBlank()) {
                return false;
            }
            return recommendation.getStatus() == AiRecommendationStatus.APPROVED
                    && recommendation.getSchool() != null
                    && recommendation.getSchool().getId().equals(activeSchoolId)
                    && "STUDENT".equalsIgnoreCase(recommendation.getTargetType())
                    && recommendation.getTargetId() != null
                    && authorizationService.canAccessStudent(user, recommendation.getTargetId());
        }
        if (user.getRole() == UserRole.OFFICE_STAFF || user.getRole() == UserRole.STAFF) {
            return activeSchoolId != null
                    && !activeSchoolId.isBlank()
                    && recommendation.getStatus() == AiRecommendationStatus.APPROVED
                    && recommendation.getSchool() != null
                    && recommendation.getSchool().getId().equals(activeSchoolId)
                    && recommendation.getRecommendationType() == AiRecommendationType.ADMISSION_FOLLOW_UP;
        }
        if (user.getRole() == UserRole.FINANCE_STAFF) {
            return activeSchoolId != null
                    && !activeSchoolId.isBlank()
                    && recommendation.getSchool() != null
                    && recommendation.getSchool().getId().equals(activeSchoolId)
                    && recommendation.getRecommendationType() == AiRecommendationType.FEE_REMINDER_SUGGESTION;
        }
        if ("STUDENT".equalsIgnoreCase(recommendation.getTargetType()) && recommendation.getTargetId() != null) {
            return authorizationService.canAccessStudent(user, recommendation.getTargetId());
        }
        return true;
    }

    private void denyRestrictedAutomation(UserAccount actor) {
        denyPublicAiAccess(actor);
        if (actor.getRole() == UserRole.PARENT) {
            throw new ForbiddenException("Parents cannot access AI automation controls.");
        }
        if (actor.getRole() == UserRole.OFFICE_STAFF || actor.getRole() == UserRole.STAFF) {
            throw new ForbiddenException("Office staff cannot access AI automation controls.");
        }
        if (actor.getRole() == UserRole.FINANCE_STAFF) {
            throw new ForbiddenException("Finance staff cannot access AI automation controls.");
        }
    }

    private void denyPublicAiAccess(UserAccount actor) {
        if (actor.getRole() == UserRole.GUEST || actor.getRole() == UserRole.SYSTEM || actor.getRole() == UserRole.AI_AGENT) {
            throw new ForbiddenException("This role cannot access AI portal APIs.");
        }
    }

    private AiRecommendationPortalResponse response(AiRecommendation recommendation) {
        return new AiRecommendationPortalResponse(
                recommendation.getId(),
                recommendation.getTenant().getId(),
                recommendation.getSchool() == null ? null : recommendation.getSchool().getId(),
                recommendation.getTargetType(),
                recommendation.getTargetId(),
                recommendation.getRecommendationType().name(),
                recommendation.getTitle(),
                recommendation.getSummary(),
                recommendation.getRationale(),
                recommendation.getConfidenceScore(),
                recommendation.getRiskLevel().name(),
                recommendation.getStatus().name(),
                recommendation.isApprovalRequired(),
                sanitizeJson(recommendation.getMetadataJson()),
                recommendation.getCreatedAt()
        );
    }

    private void audit(UserAccount actor, AiRecommendation recommendation, AuditAction action, String summary) {
        auditLogService.record(
                actor.getTenant().getId(),
                recommendation.getSchool() == null ? null : recommendation.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                action,
                "AiRecommendation",
                recommendation.getId(),
                summary,
                Map.of("recommendationId", recommendation.getId(), "status", recommendation.getStatus().name())
        );
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
}
