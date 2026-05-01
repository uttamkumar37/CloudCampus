package com.cloudcampus.auth.dto;

import java.util.Set;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        String role,
        Set<String> roles,
        String tenantSlug,
        String schoolName
) {
}
