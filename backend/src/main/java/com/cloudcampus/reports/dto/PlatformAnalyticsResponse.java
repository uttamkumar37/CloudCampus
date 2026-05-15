package com.cloudcampus.reports.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Platform-wide analytics snapshot returned by GET /v1/super-admin/analytics (CC-0309).
 * Includes both global totals and a per-tenant breakdown list.
 */
public record PlatformAnalyticsResponse(
        long                        totalTenants,
        long                        activeTenants,
        long                        totalStudents,
        long                        totalStaff,
        long                        totalSchools,
        BigDecimal                  totalFeeDue,
        BigDecimal                  totalFeePaid,
        double                      feeCollectionRate,
        List<TenantAnalyticsSummary> tenants
) {}
