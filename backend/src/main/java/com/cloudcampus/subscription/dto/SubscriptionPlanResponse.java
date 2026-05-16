package com.cloudcampus.subscription.dto;

import com.cloudcampus.subscription.entity.SubscriptionPlanCode;

public record SubscriptionPlanResponse(
        String  code,
        String  displayName,
        long    priceMonthlyPaise,
        int     maxStudentsPerSchool,
        int     maxStaffPerSchool,
        int     maxSchools,
        String  description
) {
    public static SubscriptionPlanResponse from(SubscriptionPlanCode plan) {
        return new SubscriptionPlanResponse(
                plan.name(),
                plan.getDisplayName(),
                plan.getPriceMonthlyPaise(),
                plan.getMaxStudentsPerSchool(),
                plan.getMaxStaffPerSchool(),
                plan.getMaxSchools(),
                plan.getDescription()
        );
    }
}
