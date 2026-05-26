package com.cloudcampus.identity.auth.session;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;

public record AuthTokenClaims(
        String userId,
        String tenantId,
        UserRole role,
        String activeSchoolId,
        Instant issuedAt,
        Instant expiresAt
) {
}
