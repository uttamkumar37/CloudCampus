package com.cloudcampus.subscription.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.subscription.dto.AssignPlanRequest;
import com.cloudcampus.subscription.dto.SubscriptionPlanResponse;
import com.cloudcampus.subscription.dto.TenantSubscriptionResponse;
import com.cloudcampus.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/super-admin")
@Tag(name = "Super Admin — Subscriptions", description = "Subscription plan management (Super Admin only)")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Operation(summary = "List available plans", description = "Returns all subscription plans in ascending price order.")
    @GetMapping("/subscription-plans")
    public ApiResponse<List<SubscriptionPlanResponse>> listPlans() {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), subscriptionService.listPlans());
    }

    @Operation(summary = "Get tenant subscription", description = "Returns current plan for a tenant, or a synthetic FREE default if none assigned.")
    @GetMapping("/tenants/{id}/subscription")
    public ApiResponse<TenantSubscriptionResponse> getSubscription(@PathVariable UUID id) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), subscriptionService.getSubscription(id));
    }

    @Operation(summary = "Assign or change plan", description = "Assigns a subscription plan to a tenant. Immediately updates usage limits in tenant config.")
    @PutMapping("/tenants/{id}/subscription")
    public ApiResponse<TenantSubscriptionResponse> assignPlan(
            @PathVariable UUID id,
            @Valid @RequestBody AssignPlanRequest request
    ) {
        UUID assignedBy = RequestContext.getUserId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                subscriptionService.assignPlan(id, request, assignedBy));
    }
}
