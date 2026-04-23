package com.campuscloud.exam.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExamCreateRequest(
        @NotBlank(message = "title is required")
        @Size(max = 120, message = "title must be at most 120 characters")
        String title,

        @NotNull(message = "examDate is required")
        LocalDate examDate,

        @NotNull(message = "classId is required")
        UUID classId,

        @NotNull(message = "sectionId is required")
        UUID sectionId,

        @NotNull(message = "subjectId is required")
        UUID subjectId,

        @NotNull(message = "maxMarks is required")
        @DecimalMin(value = "1.0", message = "maxMarks must be greater than zero")
        BigDecimal maxMarks
) {
}
