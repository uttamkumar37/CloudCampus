package com.cloudcampus.intelligence.ai;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai")
public class AiUsageController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AiGovernanceService aiGovernanceService;

    public AiUsageController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AiGovernanceService aiGovernanceService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.aiGovernanceService = aiGovernanceService;
    }

    @GetMapping("/entitlement")
    ResponseEntity<AiEntitlementResponse> currentTenantEntitlement(HttpServletRequest request) {
        return ResponseEntity.ok(aiGovernanceService.currentTenantEntitlement(
                authenticatedUserResolver.requireUser(request)
        ));
    }

    @PostMapping("/usage/audit")
    ResponseEntity<AiUsageAuditResponse> auditUsage(
            @Valid @RequestBody AiUsageAuditRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiGovernanceService.recordUsageAudit(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }
}
