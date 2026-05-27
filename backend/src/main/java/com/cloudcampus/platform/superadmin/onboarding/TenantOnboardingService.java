package com.cloudcampus.platform.superadmin.onboarding;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.invitation.Invitation;
import com.cloudcampus.identity.auth.invitation.InvitationRepository;
import com.cloudcampus.identity.auth.invitation.InvitationTokenService;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.notification.InvitationEmailDeliveryService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantOnboardingService {

    private static final String RESERVED_MAIN_CODE = "MAIN";

    private final TenantRepository tenantRepository;
    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final InvitationRepository invitationRepository;
    private final InvitationTokenService invitationTokenService;
    private final AuditLogService auditLogService;
    private final InvitationEmailDeliveryService invitationEmailDeliveryService;

    public TenantOnboardingService(
            TenantRepository tenantRepository,
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            InvitationRepository invitationRepository,
            InvitationTokenService invitationTokenService,
            AuditLogService auditLogService,
            InvitationEmailDeliveryService invitationEmailDeliveryService
    ) {
        this.tenantRepository = tenantRepository;
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.invitationRepository = invitationRepository;
        this.invitationTokenService = invitationTokenService;
        this.auditLogService = auditLogService;
        this.invitationEmailDeliveryService = invitationEmailDeliveryService;
    }

    @Transactional
    public TenantOnboardingResponse onboard(TenantOnboardingRequest request, AuthenticatedUser authenticatedUser) {
        String tenantCode = normalizeCode(request.tenant().code());
        String schoolCode = normalizeCode(request.firstSchool().code());
        String adminEmail = normalizeEmail(request.primaryAdmin().email());

        if (RESERVED_MAIN_CODE.equals(schoolCode)) {
            throw new BadRequestException("MAIN is reserved for internal migration only. Add the customer's real first school.");
        }
        if (tenantRepository.existsByCode(tenantCode)) {
            throw new ConflictException("Tenant code already exists.");
        }

        Tenant tenant = tenantRepository.save(new Tenant(tenantCode, request.tenant().name().trim()));
        if (schoolRepository.existsByTenantIdAndCode(tenant.getId(), schoolCode)) {
            throw new ConflictException("School code already exists for this tenant.");
        }

        School school = schoolRepository.save(new School(
                tenant,
                schoolCode,
                request.firstSchool().name().trim(),
                true
        ));
        UserAccount schoolAdmin = userAccountRepository.save(new UserAccount(
                tenant,
                adminEmail,
                request.primaryAdmin().fullName().trim(),
                UserRole.SCHOOL_ADMIN
        ));
        UserSchoolAccess access = userSchoolAccessRepository.save(new UserSchoolAccess(
                tenant,
                school,
                schoolAdmin,
                UserRole.SCHOOL_ADMIN,
                true
        ));

        String rawToken = invitationTokenService.newRawToken();
        Invitation invitation = invitationRepository.save(new Invitation(
                tenant,
                school,
                schoolAdmin,
                UserRole.SCHOOL_ADMIN,
                invitationTokenService.hash(rawToken),
                Instant.now().plus(7, ChronoUnit.DAYS)
        ));
        invitationEmailDeliveryService.queueInvitation(invitation, "/invitations/accept?token=" + rawToken);

        recordOnboardingAuditEvents(tenant, school, schoolAdmin, access, invitation, authenticatedUser.user());

        return new TenantOnboardingResponse(
                new TenantOnboardingResponse.TenantSummary(
                        tenant.getId(),
                        tenant.getCode(),
                        tenant.getName(),
                        tenant.getStatus()
                ),
                new TenantOnboardingResponse.SchoolSummary(
                        school.getId(),
                        school.getCode(),
                        school.getName(),
                        school.isPrimarySchool()
                ),
                new TenantOnboardingResponse.SchoolAdminInvitationSummary(
                        invitation.getId(),
                        schoolAdmin.getId(),
                        schoolAdmin.getEmail(),
                        UserRole.SCHOOL_ADMIN,
                        invitation.getExpiresAt(),
                        rawToken,
                        "/invitations/accept?token=" + rawToken
                ),
                new TenantOnboardingResponse.SchoolAccessSummary(
                        access.getUser().getId(),
                        access.getSchool().getId(),
                        access.getRole(),
                        access.isPrimaryAccess()
                )
        );
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void recordOnboardingAuditEvents(
            Tenant tenant,
            School school,
            UserAccount schoolAdmin,
            UserSchoolAccess access,
            Invitation invitation,
            UserAccount actor
    ) {
        String actorRole = actor.getRole().name();
        auditLogService.record(
                tenant.getId(),
                null,
                actorRole,
                actor.getId(),
                AuditAction.TENANT_CREATED,
                "Tenant",
                tenant.getId(),
                "Tenant created during Super Admin onboarding.",
                Map.of(
                        "actorRole", actorRole,
                        "tenantId", tenant.getId(),
                        "tenantCode", tenant.getCode(),
                        "tenantName", tenant.getName()
                )
        );
        auditLogService.record(
                tenant.getId(),
                school.getId(),
                actorRole,
                actor.getId(),
                AuditAction.SCHOOL_CREATED,
                "School",
                school.getId(),
                "First real school created during tenant onboarding.",
                Map.of(
                        "actorRole", actorRole,
                        "tenantId", tenant.getId(),
                        "schoolId", school.getId(),
                        "schoolCode", school.getCode(),
                        "schoolName", school.getName(),
                        "primarySchool", school.isPrimarySchool()
                )
        );
        auditLogService.record(
                tenant.getId(),
                school.getId(),
                actorRole,
                actor.getId(),
                AuditAction.SCHOOL_ADMIN_INVITED,
                "Invitation",
                invitation.getId(),
                "First School Admin invitation created.",
                Map.of(
                        "actorRole", actorRole,
                        "tenantId", tenant.getId(),
                        "schoolId", school.getId(),
                        "invitationId", invitation.getId(),
                        "userId", schoolAdmin.getId(),
                        "role", schoolAdmin.getRole().name(),
                        "maskedEmail", maskEmail(schoolAdmin.getEmail()),
                        "expiresAt", invitation.getExpiresAt().toString()
                )
        );
        auditLogService.record(
                tenant.getId(),
                school.getId(),
                actorRole,
                actor.getId(),
                AuditAction.SCHOOL_ACCESS_GRANTED,
                "UserSchoolAccess",
                access.getId(),
                "First School Admin access granted.",
                Map.of(
                        "actorRole", actorRole,
                        "tenantId", tenant.getId(),
                        "schoolId", school.getId(),
                        "accessGrantId", access.getId(),
                        "userId", schoolAdmin.getId(),
                        "role", access.getRole().name(),
                        "primaryAccess", access.isPrimaryAccess()
                )
        );
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(Math.max(atIndex, 0));
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
