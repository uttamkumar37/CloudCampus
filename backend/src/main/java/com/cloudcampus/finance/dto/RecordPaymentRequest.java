package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecordPaymentRequest(

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than zero")
        BigDecimal amount,

        LocalDate paymentDate,

        @NotNull(message = "Payment mode is required")
        PaymentMode paymentMode,

        String referenceNumber,

        UUID collectedByStaffId,

        String remarks
) {}
