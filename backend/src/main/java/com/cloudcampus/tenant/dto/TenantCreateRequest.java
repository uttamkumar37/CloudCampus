package com.cloudcampus.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantCreateRequest(
        @NotBlank @Size(max = 64) String code,
        @NotBlank @Size(max = 200) String name
) {
}

