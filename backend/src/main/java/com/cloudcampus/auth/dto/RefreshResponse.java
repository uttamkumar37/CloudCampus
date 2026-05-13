package com.cloudcampus.auth.dto;

/**
 * Outbound payload for POST /v1/auth/refresh.
 *
 * accessToken   — new short-lived JWT (15 min).
 * refreshToken  — new rotated refresh token. The old one is invalidated immediately.
 *                 Client must store this and discard the previous one.
 * expiresIn     — access token TTL in seconds.
 */
public record RefreshResponse(
        String accessToken,
        String refreshToken,
        long   expiresIn
) {}
