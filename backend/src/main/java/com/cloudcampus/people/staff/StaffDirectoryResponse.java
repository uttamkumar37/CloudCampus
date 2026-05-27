package com.cloudcampus.people.staff;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;

public record StaffDirectoryResponse(
        String id,
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
        boolean active,
        Instant createdAt
) {
}
