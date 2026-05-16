package com.cloudcampus.subscription.service;

import com.cloudcampus.subscription.dto.AssignPlanRequest;
import com.cloudcampus.subscription.dto.SubscriptionPlanResponse;
import com.cloudcampus.subscription.dto.TenantSubscriptionResponse;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    /** Returns all available subscription plans in ascending price order. */
    List<SubscriptionPlanResponse> listPlans();

    /** Returns current subscription for a tenant, or a synthetic FREE default if none assigned. */
    TenantSubscriptionResponse getSubscription(UUID tenantId);

    /**
     * Assigns or changes the subscription plan for a tenant.
     * Also writes the plan's limit values into tenant_configs so UsageLimitEnforcer
     * picks them up immediately without a restart.
     */
    TenantSubscriptionResponse assignPlan(UUID tenantId, AssignPlanRequest request,
                                          UUID assignedByUserId);
}
