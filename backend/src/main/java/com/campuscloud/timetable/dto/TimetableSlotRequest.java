package com.campuscloud.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.UUID;

public record TimetableSlotRequest(
        @NotNull UUID classId,
        @NotNull UUID sectionId,
        @NotNull UUID subjectId,
        UUID teacherId,
        @Min(1) @Max(7) short dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Size(max = 80) String label
) {
}
