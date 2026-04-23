package com.campuscloud.fees.dto;

import com.campuscloud.fees.entity.FeeStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FeeAssignmentResponse(
        UUID id,
        UUID studentId,
        String feeTitle,
        BigDecimal amount,
        BigDecimal paidAmount,
        BigDecimal dueAmount,
        LocalDate dueDate,
        FeeStatus status,
        Instant createdAt
) {
}
