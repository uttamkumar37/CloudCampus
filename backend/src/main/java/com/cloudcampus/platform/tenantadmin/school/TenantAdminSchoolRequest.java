package com.cloudcampus.platform.tenantadmin.school;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantAdminSchoolRequest(
        @NotBlank @Size(max = 40) String code,
        @NotBlank @Size(max = 180) String name
) {
}
