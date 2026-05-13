package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.Section;

import java.time.Instant;
import java.util.UUID;

public record SectionResponse(
        UUID id,
        UUID schoolId,
        UUID classId,
        String name,
        short capacity,
        Instant createdAt,
        Instant updatedAt
) {
    public static SectionResponse from(Section s) {
        return new SectionResponse(
                s.getId(), s.getSchoolId(), s.getClassId(),
                s.getName(), s.getCapacity(),
                s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
