package com.cloudcampus.platform.tenantadmin.settings;

public record TenantUsageResponse(
        String tenantId,
        String tenantCode,
        String tenantName,
        String tenantStatus,
        String planCode,
        int maxSchools,
        long schoolsUsed,
        long activeSchools,
        long remainingSchools,
        long schoolAdmins,
        long teachers,
        long staff,
        long students,
        boolean schoolLimitReached
) {
}
