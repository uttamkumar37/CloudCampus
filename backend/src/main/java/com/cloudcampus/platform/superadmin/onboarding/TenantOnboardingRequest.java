package com.cloudcampus.platform.superadmin.onboarding;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TenantOnboardingRequest(
        @Valid @NotNull TenantDetails tenant,
        @Valid @NotNull FirstSchoolDetails firstSchool,
        @Valid @NotNull PrimaryAdminDetails primaryAdmin
) {

    public record TenantDetails(
            @NotBlank @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9_-]*") String code,
            @NotBlank @Size(max = 160) String name
    ) {
    }

    public record FirstSchoolDetails(
            @NotBlank @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9_-]*") String code,
            @NotBlank @Size(max = 180) String name
    ) {
    }

    public record PrimaryAdminDetails(
            @NotBlank @Size(max = 160) String fullName,
            @NotBlank @Email @Size(max = 320) String email
    ) {
    }
}
