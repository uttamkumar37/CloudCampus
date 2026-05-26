package com.cloudcampus.platform.tenantadmin.school;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.identity.auth.invitation.Invitation;
import com.cloudcampus.identity.auth.invitation.InvitationRepository;
import com.cloudcampus.identity.auth.invitation.InvitationTokenService;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.platform.subscription.TenantSchoolLimitRepository;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantAdminSchoolService {

    private static final String RESERVED_MAIN_CODE = "MAIN";
    private static final int DEFAULT_MAX_SCHOOLS = 1;

    private final SchoolRepository schoolRepository;
    private final TenantSchoolLimitRepository tenantSchoolLimitRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final InvitationRepository invitationRepository;
    private final InvitationTokenService invitationTokenService;
    private final AuditLogService auditLogService;

    public TenantAdminSchoolService(
            SchoolRepository schoolRepository,
            TenantSchoolLimitRepository tenantSchoolLimitRepository,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            InvitationRepository invitationRepository,
            InvitationTokenService invitationTokenService,
            AuditLogService auditLogService
    ) {
        this.schoolRepository = schoolRepository;
        this.tenantSchoolLimitRepository = tenantSchoolLimitRepository;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.invitationRepository = invitationRepository;
        this.invitationTokenService = invitationTokenService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public TenantAdminSchoolResponse createSchool(AuthenticatedUser authenticatedUser, TenantAdminSchoolRequest request) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.TENANT_ADMIN) {
            throw new ForbiddenException("Only TENANT_ADMIN can create additional tenant schools.");
        }

        Tenant tenant = actor.getTenant();
        String code = normalizeCode(request.code());
        if (RESERVED_MAIN_CODE.equals(code)) {
            throw new BadRequestException("MAIN is reserved for internal migration only. Add the customer's real school.");
        }
        if (schoolRepository.existsByTenantIdAndCode(tenant.getId(), code)) {
            throw new ConflictException("School code already exists for this tenant.");
        }

        long existingSchools = schoolRepository.countByTenantId(tenant.getId());
        int maxSchools = maxSchoolsForTenant(tenant.getId());
        if (existingSchools >= maxSchools) {
            throw new ConflictException("Tenant school limit reached.");
        }

        School school = schoolRepository.save(new School(
                tenant,
                code,
                request.name().trim(),
                false
        ));
        long schoolsUsed = existingSchools + 1;
        recordSchoolCreated(actor, school, maxSchools, schoolsUsed);
        return new TenantAdminSchoolResponse(
                school.getId(),
                tenant.getId(),
                school.getCode(),
                school.getName(),
                school.isPrimarySchool(),
                school.isActive(),
                maxSchools,
                schoolsUsed
        );
    }

    @Transactional(readOnly = true)
    public List<TenantAdminSchoolResponse> schools(AuthenticatedUser authenticatedUser) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        int maxSchools = maxSchoolsForTenant(actor.getTenant().getId());
        long schoolsUsed = schoolRepository.countByTenantId(actor.getTenant().getId());
        return schoolRepository.findByTenantIdOrderByNameAsc(actor.getTenant().getId())
                .stream()
                .map(school -> toSchoolResponse(school, maxSchools, schoolsUsed))
                .toList();
    }

    @Transactional
    public TenantAdminSchoolResponse updateSchool(
            AuthenticatedUser authenticatedUser,
            String schoolId,
            TenantAdminSchoolUpdateRequest request
    ) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = requireTenantSchool(actor, schoolId, "Tenant Admin cannot edit another tenant's school.");
        String oldName = school.getName();
        school.rename(request.name());
        recordSchoolUpdated(actor, school, oldName);
        return toSchoolResponse(
                school,
                maxSchoolsForTenant(actor.getTenant().getId()),
                schoolRepository.countByTenantId(actor.getTenant().getId())
        );
    }

    @Transactional
    public TenantAdminSchoolResponse deactivateSchool(AuthenticatedUser authenticatedUser, String schoolId) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = requireTenantSchool(actor, schoolId, "Tenant Admin cannot deactivate another tenant's school.");
        if (school.isPrimarySchool()) {
            throw new ConflictException("Primary tenant school cannot be deactivated in this scaffold.");
        }
        if (!school.isActive()) {
            throw new ConflictException("School is already inactive.");
        }
        school.deactivate();
        recordSchoolDeactivated(actor, school);
        return toSchoolResponse(
                school,
                maxSchoolsForTenant(actor.getTenant().getId()),
                schoolRepository.countByTenantId(actor.getTenant().getId())
        );
    }

    @Transactional
    public TenantSchoolAdminInviteResponse inviteSchoolAdmin(
            AuthenticatedUser authenticatedUser,
            String schoolId,
            TenantSchoolAdminInviteRequest request
    ) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found."));
        if (!school.getTenant().getId().equals(actor.getTenant().getId())) {
            throw new ForbiddenException("Tenant Admin cannot assign admins to another tenant's school.");
        }

        String email = normalizeEmail(request.email());
        String fullName = request.fullName().trim();
        UserAccount schoolAdmin = findOrCreateSchoolAdmin(school, email, fullName);
        if (schoolAdmin.getRole() != UserRole.SCHOOL_ADMIN) {
            throw new ConflictException("Existing user role does not match SCHOOL_ADMIN.");
        }
        if (schoolAdmin.getStatus() == UserStatus.DISABLED) {
            throw new ForbiddenException("Disabled users cannot be assigned to a school.");
        }

        UserSchoolAccess access = grantSchoolAdminAccessIfMissing(school, schoolAdmin);
        IssuedInvitation issuedInvitation = null;
        if (schoolAdmin.getStatus() != UserStatus.ACTIVE) {
            issuedInvitation = inviteSchoolAdmin(school, schoolAdmin);
            recordSchoolAdminInvited(actor, school, schoolAdmin, issuedInvitation.invitation());
        }
        if (access != null) {
            recordSchoolAdminAccessGranted(actor, school, schoolAdmin, access);
        }

        return toInviteResponse(school, schoolAdmin, access != null, issuedInvitation);
    }

    @Transactional(readOnly = true)
    public List<TenantSchoolAdminSummaryResponse> schoolAdmins(AuthenticatedUser authenticatedUser, String schoolId) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = requireTenantSchool(actor, schoolId, "Tenant Admin cannot list another tenant's school admins.");
        return userSchoolAccessRepository.findBySchoolIdAndRoleOrderByGrantedAtAsc(school.getId(), UserRole.SCHOOL_ADMIN)
                .stream()
                .filter(access -> access.getTenant().getId().equals(actor.getTenant().getId()))
                .map(this::toAdminSummary)
                .toList();
    }

    @Transactional
    public TenantSchoolAdminInviteResponse resendSchoolAdminInvitation(
            AuthenticatedUser authenticatedUser,
            String schoolId,
            String userId
    ) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = requireTenantSchool(actor, schoolId, "Tenant Admin cannot resend invitations for another tenant's school.");
        UserAccount schoolAdmin = requireSchoolAdminUser(actor, userId);
        requireSchoolAdminAccess(school, schoolAdmin);
        if (schoolAdmin.getStatus() == UserStatus.ACTIVE) {
            throw new ConflictException("Active School Admin users do not need a new invitation.");
        }
        if (schoolAdmin.getStatus() == UserStatus.DISABLED) {
            throw new ForbiddenException("Disabled School Admin users cannot receive invitations.");
        }

        IssuedInvitation issuedInvitation = inviteSchoolAdmin(school, schoolAdmin);
        recordSchoolAdminInvitationResent(actor, school, schoolAdmin, issuedInvitation.invitation());
        return toInviteResponse(school, schoolAdmin, false, issuedInvitation);
    }

    @Transactional
    public TenantSchoolAdminAccessRevokeResponse revokeSchoolAdminAccess(
            AuthenticatedUser authenticatedUser,
            String schoolId,
            String userId
    ) {
        UserAccount actor = requireTenantAdmin(authenticatedUser);
        School school = requireTenantSchool(actor, schoolId, "Tenant Admin cannot revoke access for another tenant's school.");
        UserAccount schoolAdmin = requireSchoolAdminUser(actor, userId);
        UserSchoolAccess access = requireSchoolAdminAccess(school, schoolAdmin);
        long existingAdmins = userSchoolAccessRepository.countBySchoolIdAndRole(school.getId(), UserRole.SCHOOL_ADMIN);
        if (existingAdmins <= 1) {
            throw new ConflictException("At least one School Admin must remain assigned to a school.");
        }

        userSchoolAccessRepository.delete(access);
        long remainingAdmins = existingAdmins - 1;
        recordSchoolAdminAccessRevoked(actor, school, schoolAdmin, access, remainingAdmins);
        return new TenantSchoolAdminAccessRevokeResponse(
                school.getTenant().getId(),
                school.getId(),
                schoolAdmin.getId(),
                true,
                remainingAdmins
        );
    }

    private int maxSchoolsForTenant(String tenantId) {
        return tenantSchoolLimitRepository.findById(tenantId)
                .map(limit -> limit.getMaxSchools())
                .orElse(DEFAULT_MAX_SCHOOLS);
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private UserAccount requireTenantAdmin(AuthenticatedUser authenticatedUser) {
        UserAccount actor = authenticatedUser.user();
        if (actor.getRole() != UserRole.TENANT_ADMIN) {
            throw new ForbiddenException("Only TENANT_ADMIN can manage tenant schools.");
        }
        return actor;
    }

    private School requireTenantSchool(UserAccount actor, String schoolId, String forbiddenMessage) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found."));
        if (!school.getTenant().getId().equals(actor.getTenant().getId())) {
            throw new ForbiddenException(forbiddenMessage);
        }
        return school;
    }

    private UserAccount requireSchoolAdminUser(UserAccount actor, String userId) {
        UserAccount schoolAdmin = userAccountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("School Admin user was not found."));
        if (!schoolAdmin.getTenant().getId().equals(actor.getTenant().getId())) {
            throw new ForbiddenException("Tenant Admin cannot manage another tenant's user.");
        }
        if (schoolAdmin.getRole() != UserRole.SCHOOL_ADMIN) {
            throw new ConflictException("User role does not match SCHOOL_ADMIN.");
        }
        return schoolAdmin;
    }

    private UserSchoolAccess requireSchoolAdminAccess(School school, UserAccount schoolAdmin) {
        UserSchoolAccess access = userSchoolAccessRepository.findByUserIdAndSchoolId(schoolAdmin.getId(), school.getId())
                .orElseThrow(() -> new NotFoundException("School Admin access grant was not found."));
        if (access.getRole() != UserRole.SCHOOL_ADMIN) {
            throw new ConflictException("Existing school access role does not match SCHOOL_ADMIN.");
        }
        if (!access.getTenant().getId().equals(school.getTenant().getId())
                || !access.getUser().getTenant().getId().equals(school.getTenant().getId())
                || !access.getSchool().getId().equals(school.getId())) {
            throw new ForbiddenException("School Admin access grant tenant scope is invalid.");
        }
        return access;
    }

    private UserAccount findOrCreateSchoolAdmin(School school, String email, String fullName) {
        return userAccountRepository.findByTenantIdAndEmail(school.getTenant().getId(), email)
                .orElseGet(() -> userAccountRepository.save(new UserAccount(
                        school.getTenant(),
                        email,
                        fullName,
                        UserRole.SCHOOL_ADMIN
                )));
    }

    private UserSchoolAccess grantSchoolAdminAccessIfMissing(School school, UserAccount user) {
        var existingAccess = userSchoolAccessRepository.findByUserIdAndSchoolId(user.getId(), school.getId());
        if (existingAccess.isPresent()) {
            UserSchoolAccess existing = existingAccess.get();
            if (existing.getRole() != UserRole.SCHOOL_ADMIN) {
                throw new ConflictException("Existing school access role does not match SCHOOL_ADMIN.");
            }
            if (!existing.getTenant().getId().equals(user.getTenant().getId())
                    || !existing.getSchool().getTenant().getId().equals(user.getTenant().getId())) {
                throw new ForbiddenException("School access grant tenant scope is invalid.");
            }
            return null;
        }
        return userSchoolAccessRepository.save(new UserSchoolAccess(
                school.getTenant(),
                school,
                user,
                UserRole.SCHOOL_ADMIN,
                userSchoolAccessRepository.findByUserId(user.getId()).isEmpty()
        ));
    }

    private IssuedInvitation inviteSchoolAdmin(School school, UserAccount schoolAdmin) {
        String rawToken = invitationTokenService.newRawToken();
        Invitation invitation = invitationRepository.save(new Invitation(
                school.getTenant(),
                school,
                schoolAdmin,
                UserRole.SCHOOL_ADMIN,
                invitationTokenService.hash(rawToken),
                Instant.now().plus(7, ChronoUnit.DAYS)
        ));
        return new IssuedInvitation(invitation, rawToken);
    }

    private TenantSchoolAdminInviteResponse toInviteResponse(
            School school,
            UserAccount schoolAdmin,
            boolean schoolAccessGranted,
            IssuedInvitation issuedInvitation
    ) {
        Invitation invitation = issuedInvitation == null ? null : issuedInvitation.invitation();
        String rawToken = issuedInvitation == null ? null : issuedInvitation.rawToken();
        return new TenantSchoolAdminInviteResponse(
                school.getTenant().getId(),
                school.getId(),
                schoolAdmin.getId(),
                schoolAdmin.getEmail(),
                schoolAdmin.getDisplayName(),
                schoolAdmin.getRole(),
                schoolAdmin.getStatus(),
                schoolAccessGranted,
                issuedInvitation != null,
                invitation == null ? null : invitation.getId(),
                invitation == null ? null : invitation.getExpiresAt(),
                rawToken,
                rawToken == null ? null : "/invitations/accept?token=" + rawToken
        );
    }

    private TenantAdminSchoolResponse toSchoolResponse(School school, int maxSchools, long schoolsUsed) {
        return new TenantAdminSchoolResponse(
                school.getId(),
                school.getTenant().getId(),
                school.getCode(),
                school.getName(),
                school.isPrimarySchool(),
                school.isActive(),
                maxSchools,
                schoolsUsed
        );
    }

    private TenantSchoolAdminSummaryResponse toAdminSummary(UserSchoolAccess access) {
        Invitation latestInvitation = invitationRepository
                .findBySchoolIdAndUserIdAndRoleOrderByCreatedAtDesc(
                        access.getSchool().getId(),
                        access.getUser().getId(),
                        UserRole.SCHOOL_ADMIN
                )
                .stream()
                .findFirst()
                .orElse(null);
        return new TenantSchoolAdminSummaryResponse(
                access.getTenant().getId(),
                access.getSchool().getId(),
                access.getUser().getId(),
                access.getUser().getEmail(),
                access.getUser().getDisplayName(),
                access.getUser().getRole(),
                access.getUser().getStatus(),
                access.getId(),
                access.isPrimaryAccess(),
                latestInvitation == null ? null : latestInvitation.getId(),
                latestInvitation == null ? null : latestInvitation.getStatus(),
                latestInvitation == null ? null : latestInvitation.getExpiresAt()
        );
    }

    private void recordSchoolUpdated(UserAccount actor, School school, String oldName) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_UPDATED,
                "School",
                school.getId(),
                "School details updated by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "oldName", oldName,
                        "newName", school.getName()
                )
        );
    }

    private void recordSchoolDeactivated(UserAccount actor, School school) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_DEACTIVATED,
                "School",
                school.getId(),
                "School deactivated by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "schoolCode", school.getCode(),
                        "primarySchool", school.isPrimarySchool()
                )
        );
    }

    private void recordSchoolCreated(UserAccount actor, School school, int maxSchools, long schoolsUsed) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_CREATED,
                "School",
                school.getId(),
                "Additional school created by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "schoolCode", school.getCode(),
                        "schoolName", school.getName(),
                        "primarySchool", school.isPrimarySchool(),
                        "maxSchools", maxSchools,
                        "schoolsUsed", schoolsUsed
                )
        );
    }

    private void recordSchoolAdminInvited(UserAccount actor, School school, UserAccount schoolAdmin, Invitation invitation) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_ADMIN_INVITED,
                "Invitation",
                invitation.getId(),
                "School Admin invitation created by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "invitationId", invitation.getId(),
                        "userId", schoolAdmin.getId(),
                        "role", schoolAdmin.getRole().name(),
                        "maskedEmail", maskEmail(schoolAdmin.getEmail()),
                        "expiresAt", invitation.getExpiresAt().toString()
                )
        );
    }

    private void recordSchoolAdminAccessGranted(
            UserAccount actor,
            School school,
            UserAccount schoolAdmin,
            UserSchoolAccess access
    ) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_ACCESS_GRANTED,
                "UserSchoolAccess",
                access.getId(),
                "School Admin access granted by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "accessGrantId", access.getId(),
                        "userId", schoolAdmin.getId(),
                        "role", access.getRole().name(),
                        "primaryAccess", access.isPrimaryAccess()
                )
        );
    }

    private void recordSchoolAdminInvitationResent(
            UserAccount actor,
            School school,
            UserAccount schoolAdmin,
            Invitation invitation
    ) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_ADMIN_INVITATION_RESENT,
                "Invitation",
                invitation.getId(),
                "School Admin invitation resent by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "invitationId", invitation.getId(),
                        "userId", schoolAdmin.getId(),
                        "role", schoolAdmin.getRole().name(),
                        "maskedEmail", maskEmail(schoolAdmin.getEmail()),
                        "expiresAt", invitation.getExpiresAt().toString()
                )
        );
    }

    private void recordSchoolAdminAccessRevoked(
            UserAccount actor,
            School school,
            UserAccount schoolAdmin,
            UserSchoolAccess access,
            long remainingSchoolAdmins
    ) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_ACCESS_REVOKED,
                "UserSchoolAccess",
                access.getId(),
                "School Admin access revoked by Tenant Admin.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "accessGrantId", access.getId(),
                        "userId", schoolAdmin.getId(),
                        "role", access.getRole().name(),
                        "remainingSchoolAdmins", remainingSchoolAdmins
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

    private record IssuedInvitation(Invitation invitation, String rawToken) {
    }
}
