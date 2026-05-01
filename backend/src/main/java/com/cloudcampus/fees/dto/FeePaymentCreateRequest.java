package com.cloudcampus.fees.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FeePaymentCreateRequest(
        @NotNull(message = "feeAssignmentId is required")
        UUID feeAssignmentId,

        @NotNull(message = "amountPaid is required")
        @DecimalMin(value = "0.01", message = "amountPaid must be greater than zero")
        BigDecimal amountPaid,

        @NotNull(message = "paymentDate is required")
        LocalDate paymentDate,

        @NotBlank(message = "paymentMethod is required")
        @Size(max = 30, message = "paymentMethod must be at most 30 characters")
        String paymentMethod,

        @Size(max = 80, message = "referenceNo must be at most 80 characters")
        String referenceNo
) {
}
