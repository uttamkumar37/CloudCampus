package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.Instant;

public record FinanceReceiptResponse(
        String id,
        String tenantId,
        String schoolId,
        String demandId,
        String studentId,
        String studentName,
        String admissionNumber,
        BigDecimal amount,
        String paymentMethod,
        String paymentReference,
        String receiptNumber,
        Instant paidAt,
        String recordedByUserId,
        String recordedByName
) {
}
