package com.cloudcampus.platform.tenantadmin.school;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantAdminSchoolUpdateRequest(
        @NotBlank @Size(max = 180) String name
) {
}
