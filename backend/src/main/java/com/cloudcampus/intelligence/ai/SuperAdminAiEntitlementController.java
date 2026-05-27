package com.cloudcampus.intelligence.ai;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin/ai")
public class SuperAdminAiEntitlementController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AiGovernanceService aiGovernanceService;

    public SuperAdminAiEntitlementController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AiGovernanceService aiGovernanceService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.aiGovernanceService = aiGovernanceService;
    }

    @GetMapping("/tenants/{tenantId}/entitlement")
    ResponseEntity<AiEntitlementResponse> entitlement(
            @PathVariable String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.entitlementForTenant(
                authenticatedUserResolver.requireUser(request),
                tenantId
        ));
    }

    @PutMapping("/tenants/{tenantId}/entitlement")
    ResponseEntity<AiEntitlementResponse> updateEntitlement(
            @PathVariable String tenantId,
            @Valid @RequestBody AiEntitlementRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiGovernanceService.updateTenantEntitlement(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                requestBody
        ));
    }
}
