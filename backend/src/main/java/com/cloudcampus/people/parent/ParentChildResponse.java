package com.cloudcampus.people.parent;

public record ParentChildResponse(
        String linkId,
        String tenantId,
        String schoolId,
        String studentId,
        String studentName,
        String admissionNumber,
        String relationship,
        boolean primaryContact
) {
}
