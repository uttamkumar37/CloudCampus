package com.cloudcampus.platform.superadmin.onboarding;

import java.time.Instant;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.platform.tenant.TenantStatus;

public record TenantOnboardingResponse(
        TenantSummary tenant,
        SchoolSummary school,
        SchoolAdminInvitationSummary schoolAdminInvitation,
        SchoolAccessSummary schoolAccess
) {

    public record TenantSummary(
            String id,
            String code,
            String name,
            TenantStatus status
    ) {
    }

    public record SchoolSummary(
            String id,
            String code,
            String name,
            boolean primarySchool
    ) {
    }

    public record SchoolAdminInvitationSummary(
            String invitationId,
            String userId,
            String email,
            UserRole role,
            Instant expiresAt,
            String token,
            String acceptanceUrl
    ) {
    }

    public record SchoolAccessSummary(
            String userId,
            String schoolId,
            UserRole role,
            boolean primaryAccess
    ) {
    }
}
