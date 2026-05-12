package com.cloudcampus.timetable.dto;

import com.cloudcampus.timetable.entity.DayOfWeek;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.UUID;

public record TimetableSlotCreateRequest(

        @NotNull(message = "Academic year is required")
        UUID academicYearId,

        @NotNull(message = "Class is required")
        UUID classId,

        @NotNull(message = "Section is required")
        UUID sectionId,

        @NotNull(message = "Subject is required")
        UUID subjectId,

        /** Optional — null means free period / unassigned. */
        UUID staffId,

        @NotNull(message = "Day of week is required")
        DayOfWeek dayOfWeek,

        @NotNull(message = "Period number is required")
        @Min(value = 1, message = "Period number must be at least 1")
        @Max(value = 12, message = "Period number must not exceed 12")
        Integer periodNumber,

        LocalTime startTime,

        LocalTime endTime
) {}
