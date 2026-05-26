package com.cloudcampus.platform.tenantadmin.school;

public record TenantSchoolAdminAccessRevokeResponse(
        String tenantId,
        String schoolId,
        String userId,
        boolean accessRevoked,
        long remainingSchoolAdmins
) {
}
