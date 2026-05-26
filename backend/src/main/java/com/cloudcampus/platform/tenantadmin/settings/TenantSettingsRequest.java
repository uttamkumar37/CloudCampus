package com.cloudcampus.platform.tenantadmin.settings;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantSettingsRequest(
        @NotBlank @Size(max = 180) String displayName,
        @Email @Size(max = 320) String billingEmail,
        @Email @Size(max = 320) String supportEmail,
        @NotBlank @Size(max = 80) String timezone,
        @NotBlank @Size(max = 20) String locale
) {
}
