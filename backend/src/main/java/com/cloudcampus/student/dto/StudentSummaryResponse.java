package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;

import java.util.UUID;

/**
 * Lightweight student summary — used for listing endpoints (CC-0504).
 * Omits PII fields not needed in roster/grid views.
 */
public record StudentSummaryResponse(

        UUID          id,
        String        studentNumber,
        String        firstName,
        String        lastName,
        StudentStatus status,
        UUID          classId,
        UUID          sectionId,
        String        photoUrl
) {
    public static StudentSummaryResponse from(Student s) {
        return new StudentSummaryResponse(
                s.getId(),
                s.getStudentNumber(),
                s.getFirstName(),
                s.getLastName(),
                s.getStatus(),
                s.getClassId(),
                s.getSectionId(),
                s.getPhotoUrl()
        );
    }
}
