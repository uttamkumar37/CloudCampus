package com.cloudcampus.tenant.dto;

import jakarta.validation.constraints.NotNull;

public record TenantStatusUpdateRequest(
        @NotNull(message = "active is required")
        Boolean active
) {
}
