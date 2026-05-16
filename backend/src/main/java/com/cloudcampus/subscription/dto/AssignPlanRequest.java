package com.cloudcampus.subscription.dto;

import com.cloudcampus.subscription.entity.BillingCycle;
import com.cloudcampus.subscription.entity.SubscriptionPlanCode;
import jakarta.validation.constraints.NotNull;

public record AssignPlanRequest(

        @NotNull(message = "planCode is required")
        SubscriptionPlanCode planCode,

        @NotNull(message = "billingCycle is required")
        BillingCycle billingCycle,

        String notes
) {}
