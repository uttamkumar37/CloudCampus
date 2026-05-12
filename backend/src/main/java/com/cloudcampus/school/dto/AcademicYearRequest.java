package com.cloudcampus.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Request body for creating or updating an AcademicYear.
 */
public record AcademicYearRequest(

        @NotBlank(message = "name is required")
        String name,

        @NotNull(message = "startDate is required")
        LocalDate startDate,

        @NotNull(message = "endDate is required")
        LocalDate endDate,

        boolean makeCurrent
) {}
