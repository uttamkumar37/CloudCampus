package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Gender;
import com.cloudcampus.student.entity.StudentStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StudentResponse(
        UUID id,
        String admissionNo,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        Gender gender,
        String email,
        String phone,
        boolean active,
        Instant createdAt,
        StudentStatus status
) {
}
