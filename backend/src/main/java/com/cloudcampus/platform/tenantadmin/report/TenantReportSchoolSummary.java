package com.cloudcampus.platform.tenantadmin.report;

public record TenantReportSchoolSummary(
        String schoolId,
        String code,
        String name,
        boolean primarySchool,
        boolean active,
        TenantReportMetrics metrics
) {
}
