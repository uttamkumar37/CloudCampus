package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Gender;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.entity.StudentStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Full student response — used for GET /students/{id} and POST (admission).
 */
public record StudentResponse(

        UUID          id,
        UUID          schoolId,
        String        studentNumber,
        LocalDate     admissionDate,
        StudentStatus status,
        UUID          classId,
        UUID          sectionId,
        String        firstName,
        String        lastName,
        LocalDate     dateOfBirth,
        Gender        gender,
        String        bloodGroup,
        String        phone,
        String        address,
        String        photoUrl,
        Instant       createdAt,
        Instant       updatedAt
) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getSchoolId(),
                s.getStudentNumber(),
                s.getAdmissionDate(),
                s.getStatus(),
                s.getClassId(),
                s.getSectionId(),
                s.getFirstName(),
                s.getLastName(),
                s.getDateOfBirth(),
                s.getGender(),
                s.getBloodGroup(),
                s.getPhone(),
                s.getAddress(),
                s.getPhotoUrl(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
