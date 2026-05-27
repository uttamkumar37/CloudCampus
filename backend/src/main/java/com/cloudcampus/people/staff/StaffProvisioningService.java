package com.cloudcampus.people.staff;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
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
import com.cloudcampus.notification.InvitationEmailDeliveryService;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffProvisioningService {

    private final StaffProfileRepository staffProfileRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final InvitationRepository invitationRepository;
    private final InvitationTokenService invitationTokenService;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;
    private final InvitationEmailDeliveryService invitationEmailDeliveryService;

    public StaffProvisioningService(
            StaffProfileRepository staffProfileRepository,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            InvitationRepository invitationRepository,
            InvitationTokenService invitationTokenService,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService,
            InvitationEmailDeliveryService invitationEmailDeliveryService
    ) {
        this.staffProfileRepository = staffProfileRepository;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.invitationRepository = invitationRepository;
        this.invitationTokenService = invitationTokenService;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
        this.invitationEmailDeliveryService = invitationEmailDeliveryService;
    }

    @Transactional
    public StaffProvisioningResponse provision(AuthenticatedUser actor, StaffProvisioningRequest request) {
        if (!Boolean.TRUE.equals(request.portalLoginRequired())) {
            throw new BadRequestException("STAFF-001 provisions only portal-login-required staff accounts.");
        }
        if (request.role() != UserRole.TEACHER
                && request.role() != UserRole.FINANCE_STAFF
                && request.role() != UserRole.STAFF) {
            throw new BadRequestException("Only TEACHER, FINANCE_STAFF or STAFF users can be provisioned from this endpoint.");
        }

        School school = requireActiveSchoolAdminSchool(actor);
        String email = normalizeEmail(request.email());
        String fullName = request.fullName().trim();
        String employeeNumber = normalizeOptional(request.employeeNumber());
        if (employeeNumber != null && staffProfileRepository.existsBySchoolIdAndEmployeeNumberIgnoreCase(school.getId(), employeeNumber)) {
            throw new ConflictException("Employee number already exists for this school.");
        }

        UserAccount user = findOrCreateUser(school, email, fullName, request.role());
        if (user.getRole() != request.role()) {
            throw new ConflictException("Existing user role does not match the requested staff role.");
        }
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new ForbiddenException("Disabled users cannot be provisioned.");
        }
        staffProfileRepository.findBySchoolIdAndUserId(school.getId(), user.getId())
                .ifPresent(existing -> {
                    throw new ConflictException("Staff profile already exists for this school.");
                });

        UserSchoolAccess access = grantSchoolAccessIfMissing(school, user, request.role());
        StaffProfile profile = staffProfileRepository.save(new StaffProfile(
                school.getTenant(),
                school,
                user,
                request.role(),
                employeeNumber,
                fullName,
                email,
                normalizeOptional(request.department()),
                normalizeOptional(request.designation()),
                true
        ));

        IssuedInvitation issuedInvitation = null;
        if (user.getStatus() != UserStatus.ACTIVE) {
            issuedInvitation = inviteUser(school, user, request.role());
            recordStaffInvited(actor.user(), school, user, issuedInvitation.invitation());
        }
        recordStaffProfileCreated(actor.user(), profile);
        if (access != null) {
            recordSchoolAccessGranted(actor.user(), school, user, access);
        }

        return toResponse(profile, user, issuedInvitation);
    }

    private School requireActiveSchoolAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private UserAccount findOrCreateUser(School school, String email, String fullName, UserRole role) {
        return userAccountRepository.findByTenantIdAndEmail(school.getTenant().getId(), email)
                .orElseGet(() -> userAccountRepository.save(new UserAccount(
                        school.getTenant(),
                        email,
                        fullName,
                        role
                )));
    }

    private UserSchoolAccess grantSchoolAccessIfMissing(School school, UserAccount user, UserRole role) {
        var existingAccess = userSchoolAccessRepository.findByUserIdAndSchoolId(user.getId(), school.getId());
        if (existingAccess.isPresent()) {
            UserSchoolAccess existing = existingAccess.get();
            if (existing.getRole() != role) {
                throw new ConflictException("Existing school access role does not match the requested staff role.");
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
                role,
                userSchoolAccessRepository.findByUserId(user.getId()).isEmpty()
        ));
    }

    private IssuedInvitation inviteUser(School school, UserAccount user, UserRole role) {
        String rawToken = invitationTokenService.newRawToken();
        Invitation invitation = invitationRepository.save(new Invitation(
                school.getTenant(),
                school,
                user,
                role,
                invitationTokenService.hash(rawToken),
                Instant.now().plus(7, ChronoUnit.DAYS)
        ));
        invitationEmailDeliveryService.queueInvitation(invitation, "/invitations/accept?token=" + rawToken);
        return new IssuedInvitation(invitation, rawToken);
    }

    private StaffProvisioningResponse toResponse(
            StaffProfile profile,
            UserAccount user,
            IssuedInvitation issuedInvitation
    ) {
        Invitation invitation = issuedInvitation == null ? null : issuedInvitation.invitation();
        String rawToken = issuedInvitation == null ? null : issuedInvitation.rawToken();
        return new StaffProvisioningResponse(
                profile.getId(),
                profile.getTenant().getId(),
                profile.getSchool().getId(),
                user.getId(),
                user.getEmail(),
                profile.getFullName(),
                profile.getRole(),
                user.getStatus(),
                profile.getEmployeeNumber(),
                profile.getDepartment(),
                profile.getDesignation(),
                profile.isPortalLoginRequired(),
                true,
                issuedInvitation != null,
                invitation == null ? null : invitation.getId(),
                invitation == null ? null : invitation.getExpiresAt(),
                rawToken,
                rawToken == null ? null : "/invitations/accept?token=" + rawToken
        );
    }

    private void recordStaffInvited(UserAccount actor, School school, UserAccount user, Invitation invitation) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.STAFF_INVITED,
                "Invitation",
                invitation.getId(),
                "Staff invitation created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "invitationId", invitation.getId(),
                        "userId", user.getId(),
                        "role", user.getRole().name(),
                        "maskedEmail", maskEmail(user.getEmail()),
                        "expiresAt", invitation.getExpiresAt().toString()
                )
        );
    }

    private void recordStaffProfileCreated(UserAccount actor, StaffProfile profile) {
        auditLogService.record(
                profile.getTenant().getId(),
                profile.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.STAFF_PROFILE_CREATED,
                "StaffProfile",
                profile.getId(),
                "Staff profile created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", profile.getTenant().getId(),
                        "schoolId", profile.getSchool().getId(),
                        "staffProfileId", profile.getId(),
                        "userId", profile.getUser().getId(),
                        "role", profile.getRole().name(),
                        "portalLoginRequired", profile.isPortalLoginRequired()
                )
        );
    }

    private void recordSchoolAccessGranted(UserAccount actor, School school, UserAccount user, UserSchoolAccess access) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_ACCESS_GRANTED,
                "UserSchoolAccess",
                access.getId(),
                "Staff school access granted.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "accessGrantId", access.getId(),
                        "userId", user.getId(),
                        "role", access.getRole().name(),
                        "primaryAccess", access.isPrimaryAccess()
                )
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
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
