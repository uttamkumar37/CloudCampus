package com.cloudcampus.platform.subscription;

import java.time.Instant;

public record TenantSubscriptionResponse(
        String tenantId,
        String tenantCode,
        String tenantName,
        String tenantStatus,
        boolean subscriptionAssigned,
        String planId,
        String planCode,
        String planName,
        TenantSubscriptionStatus subscriptionStatus,
        BillingCycle billingCycle,
        int maxSchools,
        int maxStudents,
        int maxStaff,
        long schoolsUsed,
        long remainingSchools,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        String assignedByUserId,
        Instant assignedAt,
        TenantInvoiceResponse invoice
) {
}
