package com.campuscloud.exam.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record ExamResultCreateRequest(
        @NotNull(message = "examId is required")
        UUID examId,

        @NotNull(message = "studentId is required")
        UUID studentId,

        @NotNull(message = "marksObtained is required")
        @DecimalMin(value = "0.0", message = "marksObtained must be zero or positive")
        BigDecimal marksObtained,

        @Size(max = 10, message = "grade must be at most 10 characters")
        String grade,

        @Size(max = 255, message = "remarks must be at most 255 characters")
        String remarks,

        @NotNull(message = "published is required")
        Boolean published
) {
}
