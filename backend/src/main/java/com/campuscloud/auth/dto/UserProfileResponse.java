package com.campuscloud.auth.dto;

import com.campuscloud.user.entity.UserRole;

import java.util.UUID;

public record UserProfileResponse(
        UUID userId,
        String username,
        String email,
        String fullName,
        UserRole role,
        boolean active,
        String tenantSchema
) {
}
