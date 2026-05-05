package com.cloudcampus.auth.dto;

import com.cloudcampus.common.notification.NotificationChannel;
import jakarta.validation.constraints.NotNull;

public record SendOtpRequest(
        @NotNull(message = "channel is required")
        NotificationChannel channel
) {
}

