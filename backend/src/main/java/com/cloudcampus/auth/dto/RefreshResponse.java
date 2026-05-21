package com.cloudcampus.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.UUID;

/**
 * Outbound payload for POST /v1/auth/refresh.
 *
 * accessToken   — new short-lived JWT (15 min).
 * refreshToken  — new rotated refresh token. The old one is invalidated immediately.
 *                 Client must store this and discard the previous one.
 * expiresIn     — access token TTL in seconds.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RefreshResponse(
        String accessToken,
        String refreshToken,
        long   expiresIn,
        String role,
        UUID   userId,
        UUID   tenantId,
        UUID   schoolId,
        boolean requiresPasswordChange,
        List<String> features
) {}
