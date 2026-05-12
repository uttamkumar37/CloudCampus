package com.cloudcampus.reports.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FeeReportResponse(
        UUID       schoolId,
        UUID       academicYearId,
        long       totalRecords,
        BigDecimal totalAmountDue,
        BigDecimal totalAmountPaid,
        long       pendingCount,
        long       partialCount,
        long       paidCount,
        long       waivedCount,
        double     collectionRate
) {}
