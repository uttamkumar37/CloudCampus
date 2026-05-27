package com.cloudcampus.platform.subscription;

import java.time.Instant;

public record SubscriptionPlanResponse(
        String id,
        String code,
        String name,
        String description,
        SubscriptionPlanStatus status,
        int maxSchools,
        int maxStudents,
        int maxStaff,
        long monthlyPriceCents,
        long annualPriceCents,
        String currency,
        Instant createdAt,
        Instant updatedAt
) {
}
