package com.cloudcampus.student.dto;

import com.cloudcampus.school.entity.School;
import com.cloudcampus.student.entity.Student;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Lightweight identity snapshot for the authenticated student portal shell.
 */
public record StudentMeResponse(
        UUID      studentId,
        String    firstName,
        String    lastName,
        String    studentNumber,
        String    status,
        LocalDate admissionDate,
        UUID      schoolId,
        String    schoolName,
        UUID      classId,
        UUID      sectionId,
        String    photoUrl
) {
    public static StudentMeResponse from(Student student, School school) {
        return new StudentMeResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getStudentNumber(),
                student.getStatus() != null ? student.getStatus().name() : null,
                student.getAdmissionDate(),
                school.getId(),
                school.getName(),
                student.getClassId(),
                student.getSectionId(),
                student.getPhotoUrl()
        );
    }
}
