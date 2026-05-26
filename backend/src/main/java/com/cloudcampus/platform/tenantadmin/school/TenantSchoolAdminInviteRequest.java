package com.cloudcampus.platform.tenantadmin.school;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantSchoolAdminInviteRequest(
        @NotBlank @Size(max = 180) String fullName,
        @NotBlank @Email @Size(max = 320) String email
) {
}
