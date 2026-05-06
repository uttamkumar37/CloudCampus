package com.cloudcampus.teacher.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record TeacherDetailResponse(
        TeacherResponse teacher,
        int totalAssignedClasses,
        List<TimetableItem> timetable,
        List<HomeworkItem> homework
) {
    public record TimetableItem(
            UUID slotId,
            short dayOfWeek,
            LocalTime startTime,
            LocalTime endTime,
            String className,
            String sectionName,
            String subject
    ) {}

    public record HomeworkItem(
            UUID id,
            String title,
            LocalDate dueDate,
            String className,
            String sectionName,
            Instant createdAt
    ) {}
}
