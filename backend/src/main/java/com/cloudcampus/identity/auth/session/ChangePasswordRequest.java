package com.cloudcampus.identity.auth.session;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 12, message = "must be at least 12 characters") String newPassword
) {
}
