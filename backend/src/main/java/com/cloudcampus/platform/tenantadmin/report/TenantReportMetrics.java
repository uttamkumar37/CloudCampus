package com.cloudcampus.platform.tenantadmin.report;

import java.math.BigDecimal;

public record TenantReportMetrics(
        long totalStudents,
        long activeStudents,
        long totalFeeDemands,
        BigDecimal amountDue,
        BigDecimal amountPaid,
        BigDecimal outstandingAmount
) {
}
