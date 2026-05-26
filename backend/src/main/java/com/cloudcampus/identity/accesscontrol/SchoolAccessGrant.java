package com.cloudcampus.identity.accesscontrol;

import com.cloudcampus.identity.auth.UserRole;

public record SchoolAccessGrant(
        String tenantId,
        String schoolId,
        String userId,
        UserRole role,
        boolean primaryAccess
) {
}
