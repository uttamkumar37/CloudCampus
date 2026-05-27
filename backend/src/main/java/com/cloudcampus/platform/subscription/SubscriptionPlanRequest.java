package com.cloudcampus.platform.subscription;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubscriptionPlanRequest(
        @NotBlank @Size(max = 40) String code,
        @NotBlank @Size(max = 120) String name,
        @Size(max = 500) String description,
        @Min(1) int maxSchools,
        @Min(0) int maxStudents,
        @Min(0) int maxStaff,
        @Min(0) long monthlyPriceCents,
        @Min(0) long annualPriceCents,
        @NotBlank @Size(min = 3, max = 3) String currency,
        SubscriptionPlanStatus status
) {
}
