package com.cloudcampus.subscription.dto;

import com.cloudcampus.subscription.entity.SubscriptionPlanCode;
import com.cloudcampus.subscription.entity.TenantSubscription;

import java.time.Instant;
import java.util.UUID;

public record TenantSubscriptionResponse(
        UUID                     id,
        UUID                     tenantId,
        SubscriptionPlanResponse plan,
        String                   billingCycle,
        String                   status,
        Instant                  currentPeriodStart,
        Instant                  currentPeriodEnd,
        Instant                  assignedAt,
        String                   notes
) {
    public static TenantSubscriptionResponse from(TenantSubscription s) {
        return new TenantSubscriptionResponse(
                s.getId(),
                s.getTenantId(),
                SubscriptionPlanResponse.from(s.getPlanCode()),
                s.getBillingCycle().name(),
                s.getStatus().name(),
                s.getCurrentPeriodStart(),
                s.getCurrentPeriodEnd(),
                s.getAssignedAt(),
                s.getNotes()
        );
    }

    /** Synthetic FREE subscription for tenants that have never had a plan assigned. */
    public static TenantSubscriptionResponse defaultFree(UUID tenantId) {
        return new TenantSubscriptionResponse(
                null,
                tenantId,
                SubscriptionPlanResponse.from(SubscriptionPlanCode.FREE),
                "MONTHLY",
                "ACTIVE",
                null,
                null,
                null,
                "Default free plan"
        );
    }
}
