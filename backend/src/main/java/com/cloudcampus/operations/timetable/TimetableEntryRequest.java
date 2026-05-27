package com.cloudcampus.operations.timetable;

import java.time.DayOfWeek;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TimetableEntryRequest(
        @NotBlank String classLevelId,
        String sectionId,
        String subjectId,
        @NotNull DayOfWeek weekday,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotBlank @Size(max = 160) String title
) {
}
