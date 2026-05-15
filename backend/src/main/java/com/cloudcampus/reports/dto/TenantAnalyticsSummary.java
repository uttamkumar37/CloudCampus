package com.cloudcampus.reports.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Per-tenant row in the platform analytics response (CC-0309).
 */
public record TenantAnalyticsSummary(
        UUID       tenantId,
        String     tenantName,
        String     tenantCode,
        String     tenantStatus,
        long       activeStudents,
        long       activeStaff,
        long       activeSchools,
        BigDecimal totalFeeDue,
        BigDecimal totalFeePaid,
        double     feeCollectionRate
) {}
