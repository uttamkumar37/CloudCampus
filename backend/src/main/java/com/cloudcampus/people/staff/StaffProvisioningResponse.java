package com.cloudcampus.people.staff;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;

public record StaffProvisioningResponse(
        String staffProfileId,
        String tenantId,
        String schoolId,
        String userId,
        String email,
        String fullName,
        UserRole role,
        UserStatus userStatus,
        String employeeNumber,
        String department,
        String designation,
        boolean portalLoginRequired,
        boolean schoolAccessGranted,
        boolean invitationCreated,
        String invitationId,
        Instant invitationExpiresAt,
        String invitationToken,
        String invitationAcceptUrl
) {
}
