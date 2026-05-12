package com.cloudcampus.assignment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AssignmentCreateRequest(

        @NotNull(message = "Academic year is required")
        UUID academicYearId,

        @NotNull(message = "Class is required")
        UUID classId,

        UUID sectionId,

        @NotNull(message = "Subject is required")
        UUID subjectId,

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        String description,

        @NotNull(message = "Due date is required")
        @Future(message = "Due date must be in the future")
        LocalDate dueDate,

        @DecimalMin(value = "1", message = "Max marks must be at least 1")
        BigDecimal maxMarks,

        boolean publishImmediately
) {}
