package com.cloudcampus.teacher.dto;

import com.cloudcampus.teacher.entity.TeacherStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
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
        Instant createdAt,
        TeacherStatus status,
        List<ClassTeacherSection> classTeacherSections
) {
    public record ClassTeacherSection(UUID sectionId, String sectionName, UUID classId, String className) {}
}
