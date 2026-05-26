package com.cloudcampus.identity.auth.session;

import java.time.Instant;

public record ForgotPasswordResponse(
        String message,
        String resetToken,
        Instant expiresAt
) {
}
