package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.Instant;

public record FeePaymentResponse(
        String id,
        String tenantId,
        String schoolId,
        String demandId,
        String studentId,
        BigDecimal amount,
        String paymentMethod,
        String paymentReference,
        String receiptNumber,
        Instant paidAt
) {
}
