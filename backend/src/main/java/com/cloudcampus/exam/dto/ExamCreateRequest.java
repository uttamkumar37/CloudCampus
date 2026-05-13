package com.cloudcampus.exam.dto;

import com.cloudcampus.exam.entity.ExamType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Request body for creating or updating an exam.
 */
public record ExamCreateRequest(

        @NotNull(message = "Academic year is required")
        UUID academicYearId,

        @NotBlank(message = "Exam name is required")
        @Size(max = 200)
        String name,

        @NotNull(message = "Exam type is required")
        ExamType examType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotNull(message = "Total marks is required")
        @DecimalMin(value = "1", message = "Total marks must be at least 1")
        BigDecimal totalMarks,

        @NotNull(message = "Passing marks is required")
        @DecimalMin(value = "0", message = "Passing marks cannot be negative")
        BigDecimal passingMarks,

        @Size(max = 5000)
        String instructions,

        /** Optional list of subject papers to create inline. */
        List<ExamSubjectRequest> subjects
) {}
