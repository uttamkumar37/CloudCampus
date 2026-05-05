package com.cloudcampus.auth.dto;

import com.cloudcampus.common.notification.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCredentialsRequest(
        @NotNull(message = "channel is required")
        NotificationChannel channel,

        @NotBlank(message = "otp is required")
        @Size(min = 4, max = 10, message = "otp must be between 4 and 10 characters")
        String otp,

        @NotBlank(message = "newUsername is required")
        @Size(min = 5, max = 100, message = "newUsername must be between 5 and 100 characters")
        String newUsername,

        @NotBlank(message = "newPassword is required")
        @Size(min = 8, max = 64, message = "newPassword must be between 8 and 64 characters")
        String newPassword
) {
}

