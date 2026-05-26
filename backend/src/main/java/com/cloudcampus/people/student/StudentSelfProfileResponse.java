package com.cloudcampus.people.student;

import java.time.LocalDate;

public record StudentSelfProfileResponse(
        String id,
        String tenantId,
        String schoolId,
        String admissionNumber,
        String fullName,
        String classLevelId,
        String sectionId,
        String rollNumber,
        LocalDate dateOfBirth,
        String gender,
        boolean active
) {
}
