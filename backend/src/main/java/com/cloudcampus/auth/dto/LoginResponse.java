package com.cloudcampus.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

/**
 * Outbound payload for POST /v1/auth/login.
 *
 * accessToken  — short-lived JWT (15 min). Pass in Authorization: Bearer <token>.
 * refreshToken — opaque UUID string stored in Redis. Exchange via POST /v1/auth/refresh.
 * expiresIn    — access token TTL in seconds (mirrors app.jwt.access-token-expiry-seconds).
 * role         — the authenticated user's role string (e.g. "SUPER_ADMIN").
 * userId       — authenticated user's UUID.
 * tenantId     — null for SUPER_ADMIN, non-null for all tenant-scoped roles.
 * requiresPasswordChange — when true, client must redirect to the change-password flow
 *                          before accessing any other page.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
        String  accessToken,
        String  refreshToken,
        long    expiresIn,
        String  role,
        UUID    userId,
        UUID    tenantId,
        boolean requiresPasswordChange
) {}
