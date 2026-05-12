package com.cloudcampus.exam.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Request body for scheduling one subject paper within an exam.
 */
public record ExamSubjectRequest(

        @NotNull(message = "Subject is required")
        UUID subjectId,

        @NotNull(message = "Class is required")
        UUID classId,

        /** Null = all sections. */
        UUID sectionId,

        @NotNull(message = "Exam date is required")
        LocalDate examDate,

        LocalTime startTime,

        Integer durationMinutes,

        @NotNull(message = "Total marks is required")
        @DecimalMin(value = "1", message = "Total marks must be at least 1")
        BigDecimal totalMarks,

        @NotNull(message = "Passing marks is required")
        @DecimalMin(value = "0", message = "Passing marks cannot be negative")
        BigDecimal passingMarks,

        String roomNumber,

        UUID invigilatorId
) {}
