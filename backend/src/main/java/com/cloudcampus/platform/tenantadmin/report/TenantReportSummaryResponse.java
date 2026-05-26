package com.cloudcampus.platform.tenantadmin.report;

import java.util.List;

public record TenantReportSummaryResponse(
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        long totalSchools,
        long activeSchools,
        TenantReportMetrics totals,
        List<TenantReportSchoolSummary> schools
) {
}
