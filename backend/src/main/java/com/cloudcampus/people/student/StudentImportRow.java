package com.cloudcampus.people.student;

public record StudentImportRow(
        String admissionNumber,
        String fullName,
        String classLevelId,
        String sectionId,
        String rollNumber,
        String dateOfBirth,
        String gender,
        String guardianName,
        String guardianEmail,
        String guardianMobile
) {
}
