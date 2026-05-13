package com.cloudcampus.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TenantCreateRequest(
        // C-04: Tenant code must be a safe URL slug — lowercase alphanumeric + hyphens only.
        // Prevents XSS payloads, path traversal attempts, and subdomain injection.
        @NotBlank
        @Size(min = 2, max = 64, message = "Code must be between 2 and 64 characters")
        @Pattern(
                regexp = "^[a-z0-9][a-z0-9\\-]{1,62}[a-z0-9]$",
                message = "Code must contain only lowercase letters, digits, and hyphens, and cannot start or end with a hyphen"
        )
        String code,

        @NotBlank
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        String name
) {
}

