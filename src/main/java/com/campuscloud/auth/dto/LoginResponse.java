package com.campuscloud.auth.dto;

import java.util.Set;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        Set<String> roles
) {
}
