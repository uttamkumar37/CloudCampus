package com.cloudcampus.platform.subscription;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/super-admin/subscriptions")
public class SuperAdminSubscriptionController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final SuperAdminSubscriptionService superAdminSubscriptionService;

    public SuperAdminSubscriptionController(
            AuthenticatedUserResolver authenticatedUserResolver,
            SuperAdminSubscriptionService superAdminSubscriptionService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.superAdminSubscriptionService = superAdminSubscriptionService;
    }

    @GetMapping("/plans")
    ResponseEntity<List<SubscriptionPlanResponse>> plans(HttpServletRequest request) {
        return ResponseEntity.ok(superAdminSubscriptionService.plans(authenticatedUserResolver.requireUser(request)));
    }

    @PostMapping("/plans")
    ResponseEntity<SubscriptionPlanResponse> createPlan(
            @Valid @RequestBody SubscriptionPlanRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(superAdminSubscriptionService.createPlan(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @PatchMapping("/plans/{planId}")
    ResponseEntity<SubscriptionPlanResponse> updatePlan(
            @PathVariable String planId,
            @Valid @RequestBody SubscriptionPlanRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminSubscriptionService.updatePlan(
                authenticatedUserResolver.requireUser(request),
                planId,
                requestBody
        ));
    }

    @GetMapping("/tenants/{tenantId}")
    ResponseEntity<TenantSubscriptionResponse> tenantSubscription(
            @PathVariable String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminSubscriptionService.tenantSubscription(
                authenticatedUserResolver.requireUser(request),
                tenantId
        ));
    }

    @PutMapping("/tenants/{tenantId}")
    ResponseEntity<TenantSubscriptionResponse> assignTenantSubscription(
            @PathVariable String tenantId,
            @Valid @RequestBody TenantSubscriptionAssignmentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminSubscriptionService.assignTenantSubscription(
                authenticatedUserResolver.requireUser(request),
                tenantId,
                requestBody
        ));
    }

    @GetMapping("/tenants/{tenantId}/invoices")
    ResponseEntity<List<TenantInvoiceResponse>> tenantInvoices(
            @PathVariable String tenantId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(superAdminSubscriptionService.tenantInvoices(
                authenticatedUserResolver.requireUser(request),
                tenantId
        ));
    }
}
