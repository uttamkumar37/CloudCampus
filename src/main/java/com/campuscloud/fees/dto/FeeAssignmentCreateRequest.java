package com.campuscloud.fees.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FeeAssignmentCreateRequest(
        @NotNull(message = "studentId is required")
        UUID studentId,

        @NotBlank(message = "feeTitle is required")
        @Size(max = 120, message = "feeTitle must be at most 120 characters")
        String feeTitle,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "dueDate is required")
        LocalDate dueDate
) {
}
