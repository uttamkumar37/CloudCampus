package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.Department;

import java.time.Instant;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        UUID schoolId,
        String name,
        String code,
        String description,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
    public static DepartmentResponse from(Department d) {
        return new DepartmentResponse(
                d.getId(), d.getSchoolId(), d.getName(), d.getCode(),
                d.getDescription(), d.isActive(),
                d.getCreatedAt(), d.getUpdatedAt()
        );
    }
}
