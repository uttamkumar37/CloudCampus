package com.cloudcampus.people.parent;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserStatus;

public record ParentDirectoryResponse(
        String linkId,
        String tenantId,
        String schoolId,
        String parentUserId,
        String parentName,
        String parentEmail,
        UserStatus parentStatus,
        String studentId,
        String studentName,
        String admissionNumber,
        String relationship,
        String contactMobile,
        boolean primaryContact,
        Instant createdAt
) {
}
