package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FeeDemandRequest(
        @NotBlank
        String studentId,
        @NotBlank
        String description,
        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount,
        @NotNull
        LocalDate dueDate
) {
}
