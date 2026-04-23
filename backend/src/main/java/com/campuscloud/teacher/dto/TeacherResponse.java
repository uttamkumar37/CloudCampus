package com.campuscloud.teacher.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TeacherResponse(
        UUID id,
        String employeeNo,
        String firstName,
        String lastName,
        String email,
        String phone,
        LocalDate hireDate,
        boolean active,
        Instant createdAt
) {
}
