package com.cloudcampus.platform.subscription;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;

public record TenantSubscriptionAssignmentRequest(
        @NotBlank String planCode,
        BillingCycle billingCycle,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        boolean issueInvoice,
        Instant invoiceDueAt
) {
}
