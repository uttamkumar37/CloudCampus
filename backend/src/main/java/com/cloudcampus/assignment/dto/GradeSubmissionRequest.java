package com.cloudcampus.assignment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GradeSubmissionRequest(

        @NotNull(message = "Marks obtained is required")
        @DecimalMin(value = "0", message = "Marks cannot be negative")
        BigDecimal marksObtained,

        String feedback
) {}
