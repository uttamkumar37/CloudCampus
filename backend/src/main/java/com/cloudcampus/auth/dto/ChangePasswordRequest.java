package com.cloudcampus.auth.dto;

import com.cloudcampus.common.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for POST /v1/auth/change-password (E43 / CC-0116).
 */
public record ChangePasswordRequest(
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @StrongPassword
        String newPassword
) {}
