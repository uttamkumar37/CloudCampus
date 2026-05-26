package com.cloudcampus.platform.tenantadmin.school;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.invitation.InvitationStatus;

public record TenantSchoolAdminSummaryResponse(
        String tenantId,
        String schoolId,
        String userId,
        String email,
        String fullName,
        UserRole role,
        UserStatus userStatus,
        String accessGrantId,
        boolean primaryAccess,
        String latestInvitationId,
        InvitationStatus latestInvitationStatus,
        Instant latestInvitationExpiresAt
) {
}
