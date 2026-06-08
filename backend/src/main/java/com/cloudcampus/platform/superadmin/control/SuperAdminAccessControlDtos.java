package com.cloudcampus.platform.superadmin.control;

import java.time.Instant;
import java.util.List;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;

record SuperAdminAccessControlUserResponse(
        String userId,
        String tenantId,
        String tenantName,
        String email,
        String displayName,
        String primaryRole,
        String status,
        boolean mfaRequired,
        Instant activatedAt,
        List<SuperAdminUserRoleAssignmentResponse> roles,
        List<SuperAdminPermissionOverrideResponse> permissionOverrides,
        List<SuperAdminSchoolAccessResponse> schoolAccess
) {
}

record SuperAdminUserRoleAssignmentResponse(
        String roleAssignmentId,
        String role,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String scopeType,
        String scopeId,
        boolean active,
        Instant startsAt,
        Instant expiresAt,
        String reason,
        Instant createdAt
) {
}

record SuperAdminPermissionResponse(
        String code,
        String name,
        String description,
        String category,
        String riskLevel,
        String scopeType,
        boolean active
) {
}

record SuperAdminPermissionOverrideResponse(
        String overrideId,
        String userId,
        String permissionCode,
        String permissionName,
        boolean allowed,
        String tenantId,
        String tenantName,
        String schoolId,
        String schoolName,
        String scopeType,
        String scopeId,
        boolean active,
        String reason,
        Instant expiresAt,
        Instant createdAt
) {
}

record SuperAdminSchoolAccessResponse(
        String schoolId,
        String schoolName,
        String role,
        boolean primaryAccess
) {
}

record RoleAssignmentRequest(
        UserRole role,
        String tenantId,
        String schoolId,
        String scopeType,
        String scopeId,
        Boolean primaryRole,
        Instant startsAt,
        Instant expiresAt,
        String reason
) {
}

record RoleAssignmentUpdateRequest(
        Boolean active,
        Instant startsAt,
        Instant expiresAt,
        String reason
) {
}

record PermissionOverrideRequest(
        String permissionCode,
        Boolean allowed,
        String tenantId,
        String schoolId,
        String scopeType,
        String scopeId,
        Instant startsAt,
        Instant expiresAt,
        String reason
) {
}

record PermissionOverrideUpdateRequest(
        Boolean active,
        Instant expiresAt,
        String reason
) {
}

record StudentGuardianRequest(
        String guardianUserId,
        String relation,
        String contactEmail,
        String contactMobile,
        Boolean primaryContact,
        Boolean canPickup,
        Boolean emergencyContact
) {
}

record StudentGuardianUpdateRequest(
        String relation,
        Boolean primaryContact,
        Boolean canPickup,
        Boolean emergencyContact,
        Boolean active
) {
}

record SuperAdminStudentGuardianResponse(
        String guardianLinkId,
        String studentId,
        String guardianUserId,
        String guardianName,
        String guardianEmail,
        String relation,
        boolean primaryContact,
        boolean canPickup,
        boolean emergencyContact,
        boolean active,
        Instant createdAt
) {
}

record TeacherAssignmentGovernanceRequest(
        String classSubjectAssignmentId,
        String sectionId,
        String roleType,
        Boolean active,
        String reason
) {
}

record SuperAdminTeacherAssignmentResponse(
        String assignmentId,
        String teacherUserId,
        String teacherName,
        String tenantId,
        String schoolId,
        String schoolName,
        String classLevelId,
        String classLevelName,
        String sectionId,
        String sectionName,
        String subjectId,
        String subjectName,
        String roleType,
        boolean active,
        Instant createdAt
) {
}

record AccessControlUserQuery(
        int page,
        int size,
        String search,
        String tenantId,
        String schoolId,
        UserRole role,
        UserStatus status
) {
}
