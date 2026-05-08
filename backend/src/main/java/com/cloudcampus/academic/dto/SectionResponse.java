package com.cloudcampus.academic.dto;

import java.time.Instant;
import java.util.UUID;

public record SectionResponse(
        UUID id,
        String name,
        UUID classId,
        String className,
        boolean active,
        Instant createdAt,
        UUID classTeacherId,
        String classTeacherName
) {
}
