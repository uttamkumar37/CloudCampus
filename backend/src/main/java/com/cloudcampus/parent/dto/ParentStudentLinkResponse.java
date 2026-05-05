package com.cloudcampus.parent.dto;

import java.time.Instant;
import java.util.UUID;

public record ParentStudentLinkResponse(
        UUID linkId,
        UUID parentUserId,
        String parentFullName,
        String parentEmail,
        UUID studentId,
        String admissionNo,
        String studentFirstName,
        String studentLastName,
        Instant linkedAt
) {
}
