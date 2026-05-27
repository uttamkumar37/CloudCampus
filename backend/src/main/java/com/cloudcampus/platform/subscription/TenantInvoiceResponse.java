package com.cloudcampus.platform.subscription;

import java.time.Instant;

public record TenantInvoiceResponse(
        String id,
        String tenantId,
        String planId,
        String planCode,
        String invoiceNumber,
        BillingCycle billingCycle,
        long amountCents,
        String currency,
        TenantInvoiceStatus status,
        Instant issuedAt,
        Instant dueAt
) {
}
