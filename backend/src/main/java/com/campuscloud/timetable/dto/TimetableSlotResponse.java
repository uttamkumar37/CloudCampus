package com.campuscloud.timetable.dto;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public record TimetableSlotResponse(
        UUID id,
        UUID classId,
        UUID sectionId,
        UUID subjectId,
        UUID teacherId,
        short dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        String label,
        Instant createdAt
) {
}
