package com.cloudcampus.platform.tenantadmin.school;

public record TenantAdminSchoolResponse(
        String id,
        String tenantId,
        String code,
        String name,
        boolean primarySchool,
        boolean active,
        int maxSchools,
        long schoolsUsed
) {
}
