package com.cloudcampus.platform.superadmin.control;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;
import com.cloudcampus.intelligence.ai.AiRecommendationRiskLevel;
import com.cloudcampus.intelligence.ai.AiRecommendationStatus;
import com.cloudcampus.intelligence.ai.AiRecommendationType;
import com.cloudcampus.intelligence.ai.AutomationRunStatus;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin/ai")
public class SuperAdminAiGovernanceController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final SuperAdminAiGovernanceService aiGovernanceService;

    public SuperAdminAiGovernanceController(
            AuthenticatedUserResolver authenticatedUserResolver,
            SuperAdminAiGovernanceService aiGovernanceService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.aiGovernanceService = aiGovernanceService;
    }

    @GetMapping("/recommendations")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAiRecommendationResponse>> recommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false, name = "type") AiRecommendationType type,
            @RequestParam(required = false) AiRecommendationStatus status,
            @RequestParam(required = false) AiRecommendationRiskLevel riskLevel,
            @RequestParam(required = false) String assignedTo,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.recommendations(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                tenantId,
                schoolId,
                type,
                status,
                riskLevel,
                assignedTo
        ));
    }

    @PostMapping("/recommendations")
    ResponseEntity<SuperAdminAiRecommendationResponse> createRecommendation(
            @Valid @RequestBody AiRecommendationCreateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.createRecommendation(authenticatedUserResolver.requireUser(request), requestBody));
    }

    @GetMapping("/recommendations/{id}")
    ResponseEntity<SuperAdminAiRecommendationResponse> recommendation(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.recommendation(authenticatedUserResolver.requireUser(request), id));
    }

    @PostMapping("/recommendations/{id}/approve")
    ResponseEntity<SuperAdminAiRecommendationResponse> approveRecommendation(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.approve(authenticatedUserResolver.requireUser(request), id));
    }

    @PostMapping("/recommendations/{id}/reject")
    ResponseEntity<SuperAdminAiRecommendationResponse> rejectRecommendation(
            @PathVariable String id,
            @RequestBody(required = false) AiRecommendationDecisionRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.reject(authenticatedUserResolver.requireUser(request), id, requestBody));
    }

    @PostMapping("/recommendations/{id}/execute")
    ResponseEntity<SuperAdminAiRecommendationResponse> executeRecommendation(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.execute(authenticatedUserResolver.requireUser(request), id));
    }

    @GetMapping("/automation-rules")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAutomationRuleResponse>> automationRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) Boolean enabled,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.automationRules(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                tenantId,
                schoolId,
                enabled
        ));
    }

    @PostMapping("/automation-rules")
    ResponseEntity<SuperAdminAutomationRuleResponse> createAutomationRule(
            @Valid @RequestBody AutomationRuleRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.createAutomationRule(authenticatedUserResolver.requireUser(request), requestBody));
    }

    @PatchMapping("/automation-rules/{id}")
    ResponseEntity<SuperAdminAutomationRuleResponse> updateAutomationRule(
            @PathVariable String id,
            @Valid @RequestBody AutomationRuleUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.updateAutomationRule(authenticatedUserResolver.requireUser(request), id, requestBody));
    }

    @GetMapping("/automation-runs")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAutomationRunResponse>> automationRuns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) AutomationRunStatus status,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.automationRuns(
                authenticatedUserResolver.requireUser(request),
                page,
                size,
                tenantId,
                schoolId,
                status
        ));
    }

    @GetMapping("/policies")
    ResponseEntity<SuperAdminPageResponse<SuperAdminAiPolicyResponse>> policies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.policies(authenticatedUserResolver.requireUser(request), page, size, tenantId));
    }

    @GetMapping("/policies/{tenantId}")
    ResponseEntity<SuperAdminAiPolicyResponse> policy(
            @PathVariable String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.policy(authenticatedUserResolver.requireUser(request), tenantId));
    }

    @PutMapping("/policies/{tenantId}")
    ResponseEntity<SuperAdminAiPolicyResponse> updatePolicy(
            @PathVariable String tenantId,
            @Valid @RequestBody AiPolicyUpdateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.updatePolicy(authenticatedUserResolver.requireUser(request), tenantId, requestBody));
    }
}
