package com.cloudcampus.people.parent;

import java.time.Instant;

public record ParentLinkResponse(
        String linkId,
        String tenantId,
        String schoolId,
        String studentId,
        String studentName,
        String parentUserId,
        String parentEmail,
        String relationship,
        boolean primaryContact,
        boolean invitationCreated,
        String invitationId,
        Instant invitationExpiresAt,
        String invitationToken,
        String acceptanceUrl
) {
}
