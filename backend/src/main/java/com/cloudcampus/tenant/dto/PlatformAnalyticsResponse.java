package com.cloudcampus.tenant.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlatformAnalyticsResponse(
        long totalTenants,
        long activeTenants,
        long totalStudents,
        long totalStaff,
        long totalSchools,
        BigDecimal totalFeeDue,
        BigDecimal totalFeePaid,
        double feeCollectionRate,
        List<TenantAnalyticsSummary> tenants
) {}
