package com.cloudcampus.operations.finance;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FeePaymentRequest(
        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount,
        @NotBlank
        String paymentMethod,
        String paymentReference
) {
}
