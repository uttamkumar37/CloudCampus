package com.cloudcampus.people.student;

import java.time.LocalDate;

public record StudentResponse(
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
        String guardianName,
        String guardianEmail,
        String guardianMobile,
        boolean active
) {
}
