package com.cloudcampus.tenant.dto;

import java.math.BigDecimal;

public record TenantAnalyticsSummary(
        String tenantId,
        String tenantName,
        String tenantCode,
        String tenantStatus,
        long activeStudents,
        long activeStaff,
        long activeSchools,
        BigDecimal totalFeeDue,
        BigDecimal totalFeePaid,
        double feeCollectionRate
) {}
