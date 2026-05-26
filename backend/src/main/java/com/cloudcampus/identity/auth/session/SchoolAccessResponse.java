package com.cloudcampus.identity.auth.session;

import com.cloudcampus.identity.auth.UserRole;

public record SchoolAccessResponse(
        String schoolId,
        String code,
        String name,
        UserRole role,
        boolean primaryAccess
) {
}
