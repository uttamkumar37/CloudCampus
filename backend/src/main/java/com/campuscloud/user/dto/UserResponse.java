package com.campuscloud.user.dto;

import com.campuscloud.user.entity.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String username,
        String email,
        UserRole role,
        boolean active,
        Instant createdAt
) {
}
