package com.campuscloud.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TenantCreateRequest(
        @NotBlank(message = "tenantId is required")
        @Size(max = 50, message = "tenantId must be at most 50 characters")
        @Pattern(regexp = "^[a-z0-9_-]+$", message = "tenantId must contain lowercase letters, numbers, underscore or hyphen")
        String tenantId,

        @NotBlank(message = "schoolName is required")
        @Size(max = 150, message = "schoolName must be at most 150 characters")
        String schoolName,

        @Size(max = 63, message = "schemaName must be at most 63 characters")
        @Pattern(regexp = "^$|^[a-z0-9_]+$", message = "schemaName must contain lowercase letters, numbers or underscore")
        String schemaName
) {
}
