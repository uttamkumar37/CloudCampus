package com.campuscloud.student.dto;

import com.campuscloud.student.entity.Gender;

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
        Instant createdAt
) {
}
