package com.cloudcampus.operations.timetable;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;

public record TimetableEntryResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String classLevelName,
        String sectionId,
        String sectionName,
        String subjectId,
        String subjectName,
        DayOfWeek weekday,
        LocalTime startTime,
        LocalTime endTime,
        String title,
        Instant createdAt
) {
}
