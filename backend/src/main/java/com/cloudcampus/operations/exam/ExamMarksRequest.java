package com.cloudcampus.operations.exam;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExamMarksRequest(
        @NotBlank String studentId,
        @NotNull @DecimalMin(value = "0.00") BigDecimal marksObtained
) {
}
