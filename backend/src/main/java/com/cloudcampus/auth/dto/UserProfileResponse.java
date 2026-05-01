package com.cloudcampus.auth.dto;

import com.cloudcampus.user.entity.UserRole;

public record UserProfileResponse(
        String username,
        String email,
        String fullName,
        UserRole role,
        boolean active,
        String tenantSlug,
        String schoolName
) {
}
