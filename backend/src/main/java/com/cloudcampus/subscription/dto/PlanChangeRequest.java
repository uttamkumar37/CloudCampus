package com.cloudcampus.subscription.dto;

import com.cloudcampus.subscription.entity.BillingCycle;
import com.cloudcampus.subscription.entity.SubscriptionPlanCode;
import jakarta.validation.constraints.NotNull;

/**
 * Inbound payload for tenant-initiated plan change (preview + upgrade).
 *
 * `billingCycle` is optional — defaults to the tenant's current cycle if absent.
 */
public record PlanChangeRequest(
        @NotNull SubscriptionPlanCode targetPlan,
        BillingCycle billingCycle
) {}
