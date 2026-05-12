package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.Subject;

import java.time.Instant;
import java.util.UUID;

public record SubjectResponse(
        UUID id,
        UUID schoolId,
        String name,
        String code,
        String description,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
    public static SubjectResponse from(Subject s) {
        return new SubjectResponse(
                s.getId(), s.getSchoolId(), s.getName(), s.getCode(),
                s.getDescription(), s.isActive(),
                s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
