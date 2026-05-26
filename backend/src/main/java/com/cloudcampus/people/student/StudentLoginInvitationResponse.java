package com.cloudcampus.people.student;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserStatus;

public record StudentLoginInvitationResponse(
        String studentId,
        String tenantId,
        String schoolId,
        String userId,
        String email,
        UserStatus userStatus,
        boolean schoolAccessGranted,
        boolean invitationCreated,
        String invitationId,
        Instant invitationExpiresAt,
        String invitationToken,
        String invitationAcceptUrl
) {
}
