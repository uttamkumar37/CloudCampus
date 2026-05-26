package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record FeeDemandResponse(
        String id,
        String tenantId,
        String schoolId,
        String studentId,
        String studentName,
        String admissionNumber,
        String description,
        BigDecimal amountDue,
        BigDecimal amountPaid,
        BigDecimal outstandingAmount,
        LocalDate dueDate,
        FeeDemandStatus status,
        Instant createdAt,
        List<FeePaymentResponse> payments
) {
}
