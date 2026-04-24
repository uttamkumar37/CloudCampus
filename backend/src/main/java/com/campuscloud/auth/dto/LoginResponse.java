package com.campuscloud.auth.dto;

import java.util.Set;
import java.util.UUID;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        String role,
        Set<String> roles,
        UUID userId,
        String tenantId
) {
}
