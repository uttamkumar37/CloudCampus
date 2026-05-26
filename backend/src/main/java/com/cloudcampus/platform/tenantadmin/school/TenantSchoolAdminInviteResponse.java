package com.cloudcampus.platform.tenantadmin.school;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;

public record TenantSchoolAdminInviteResponse(
        String tenantId,
        String schoolId,
        String userId,
        String email,
        String fullName,
        UserRole role,
        UserStatus userStatus,
        boolean schoolAccessGranted,
        boolean invitationCreated,
        String invitationId,
        Instant invitationExpiresAt,
        String invitationToken,
        String invitationAcceptUrl
) {
}
