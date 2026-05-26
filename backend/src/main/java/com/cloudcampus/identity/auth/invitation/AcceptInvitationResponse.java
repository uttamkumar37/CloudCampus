package com.cloudcampus.identity.auth.invitation;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;

public record AcceptInvitationResponse(
        String userId,
        String tenantId,
        String schoolId,
        UserRole role,
        UserStatus status,
        boolean schoolAccessGranted
) {
}
