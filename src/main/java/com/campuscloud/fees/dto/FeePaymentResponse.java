package com.campuscloud.fees.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FeePaymentResponse(
        UUID id,
        UUID feeAssignmentId,
        BigDecimal amountPaid,
        LocalDate paymentDate,
        String paymentMethod,
        String referenceNo,
        UUID receivedByUserId,
        Instant createdAt
) {
}
