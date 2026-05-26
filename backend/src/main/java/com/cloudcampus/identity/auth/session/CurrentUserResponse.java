package com.cloudcampus.identity.auth.session;

import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

public record CurrentUserResponse(
        String userId,
        String email,
        String displayName,
        UserRole role,
        String tenantId,
        SchoolAccessResponse activeSchool,
        List<SchoolAccessResponse> allowedSchools
) {
}
