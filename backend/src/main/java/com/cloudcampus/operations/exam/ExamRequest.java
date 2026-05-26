package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExamRequest(
        @NotBlank String classLevelId,
        String sectionId,
        @NotBlank String subjectId,
        @NotBlank @Size(max = 160) String title,
        @NotNull LocalDate examDate,
        @NotNull @DecimalMin(value = "1.00") BigDecimal maxMarks
) {
}
