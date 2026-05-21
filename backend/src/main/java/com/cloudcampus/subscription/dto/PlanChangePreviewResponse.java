package com.cloudcampus.subscription.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.cloudcampus.subscription.entity.SubscriptionPlanCode;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Preview the effect of changing the tenant's subscription plan.
 *
 * Returned by POST /v1/tenant/subscription/preview. The caller can show the
 * customer exactly what their next invoice will look like before they commit.
 *
 * `prorationPaise` is positive when the customer owes money for the unused
 * portion of the new plan in the current cycle, and negative when the change
 * results in a credit toward future cycles.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PlanChangePreviewResponse(
        SubscriptionPlanCode currentPlan,
        SubscriptionPlanCode targetPlan,
        String               billingCycle,
        Instant              effectiveAt,
        long                 prorationPaise,
        BigDecimal           prorationRupees,
        long                 nextInvoicePaise,
        BigDecimal           nextInvoiceRupees,
        Instant              nextInvoiceDate,
        boolean              requiresPayment,
        String               summary
) {}
