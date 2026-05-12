package com.cloudcampus.school.dto;

import com.cloudcampus.school.entity.ClassRoom;

import java.time.Instant;
import java.util.UUID;

public record ClassRoomResponse(
        UUID id,
        UUID schoolId,
        UUID academicYearId,
        String name,
        String displayName,
        short gradeOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static ClassRoomResponse from(ClassRoom c) {
        return new ClassRoomResponse(
                c.getId(), c.getSchoolId(), c.getAcademicYearId(),
                c.getName(), c.getDisplayName(), c.getGradeOrder(),
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}
