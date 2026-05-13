package com.cloudcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Inbound payload for POST /v1/auth/refresh and POST /v1/auth/logout.
 *
 * refreshToken — the opaque UUID string returned by the login endpoint.
 *               Stored in Redis as rt:{token} → userId with 30-day TTL.
 */
public record RefreshRequest(

        @NotBlank
        String refreshToken
) {}
