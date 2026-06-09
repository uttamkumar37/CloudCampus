package com.cloudcampus.people.student;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentLoginService {

    private final StudentRepository studentRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final InvitationRepository invitationRepository;
    private final InvitationTokenService invitationTokenService;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;
    private final InvitationEmailDeliveryService invitationEmailDeliveryService;

    public StudentLoginService(
            StudentRepository studentRepository,
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            InvitationRepository invitationRepository,
            InvitationTokenService invitationTokenService,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService,
            InvitationEmailDeliveryService invitationEmailDeliveryService
    ) {
        this.studentRepository = studentRepository;
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.invitationRepository = invitationRepository;
        this.invitationTokenService = invitationTokenService;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
        this.invitationEmailDeliveryService = invitationEmailDeliveryService;
    }

    @Transactional
    public StudentLoginInvitationResponse inviteStudentLogin(
            AuthenticatedUser actor,
            String studentId,
            StudentLoginInvitationRequest request
    ) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), student.getSchool().getId());

        String email = normalizeEmail(request.email());
        UserAccount user = findOrCreateStudentUser(student, email);
        if (user.getRole() != UserRole.STUDENT) {
            throw new ConflictException("The existing user for this email is not a student.");
        }
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new ForbiddenException("Disabled users cannot be invited.");
        }
        linkStudentToUser(student, user, email);

        UserSchoolAccess access = grantSchoolAccessIfMissing(student, user);
        IssuedInvitation issuedInvitation = null;
        if (user.getStatus() != UserStatus.ACTIVE) {
            issuedInvitation = inviteStudent(student, user);
            recordStudentLoginInvited(actor.user(), student, user, issuedInvitation.invitation());
        }
        recordStudentLoginEnabled(actor.user(), student, user);
        if (access != null) {
            recordSchoolAccessGranted(actor.user(), student, user, access);
        }

        return toResponse(student, user, access != null, issuedInvitation);
    }

    @Transactional(readOnly = true)
    public StudentSelfProfileResponse selfProfile(AuthenticatedUser actor) {
        if (actor.user().getRole() != UserRole.STUDENT) {
            throw new ForbiddenException("Student access is required.");
        }
        Student student = studentRepository.findByUserId(actor.user().getId())
                .filter(candidate -> candidate.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(candidate -> candidate.getUser() != null && candidate.getUser().getId().equals(actor.user().getId()))
                .orElseThrow(() -> new ForbiddenException("Student profile is not linked to this user."));
        if (actor.activeSchoolId() == null || actor.activeSchoolId().isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        if (!student.getSchool().getId().equals(actor.activeSchoolId())) {
            throw new ForbiddenException("Student profile is not linked to the active school.");
        }
        return toSelfProfileResponse(student);
    }

    private UserAccount findOrCreateStudentUser(Student student, String email) {
        return userAccountRepository.findByTenantIdAndEmail(student.getTenant().getId(), email)
                .orElseGet(() -> userAccountRepository.save(new UserAccount(
                        student.getTenant(),
                        email,
                        student.getFullName(),
                        UserRole.STUDENT
                )));
    }

    private void linkStudentToUser(Student student, UserAccount user, String requestedEmail) {
        UserAccount existingLinkedUser = student.getUser();
        if (existingLinkedUser != null) {
            if (!existingLinkedUser.getId().equals(user.getId())) {
                throw new ConflictException("Student is already linked to another login user.");
            }
            if (!existingLinkedUser.getEmail().equalsIgnoreCase(requestedEmail)) {
                throw new ConflictException("Student login email does not match the linked user.");
            }
            return;
        }
        student.attachUser(user);
    }

    private UserSchoolAccess grantSchoolAccessIfMissing(Student student, UserAccount user) {
        var existingAccess = userSchoolAccessRepository.findByUserIdAndSchoolId(user.getId(), student.getSchool().getId());
        if (existingAccess.isPresent()) {
            UserSchoolAccess access = existingAccess.get();
            if (access.getRole() != UserRole.STUDENT) {
                throw new ConflictException("Existing school access role does not match the student role.");
            }
            if (!access.getTenant().getId().equals(user.getTenant().getId())
                    || !access.getSchool().getTenant().getId().equals(user.getTenant().getId())) {
                throw new ForbiddenException("School access grant tenant scope is invalid.");
            }
            return null;
        }
        return userSchoolAccessRepository.save(new UserSchoolAccess(
                student.getTenant(),
                student.getSchool(),
                user,
                UserRole.STUDENT,
                userSchoolAccessRepository.findByUserId(user.getId()).isEmpty()
        ));
    }

    private IssuedInvitation inviteStudent(Student student, UserAccount user) {
        String rawToken = invitationTokenService.newRawToken();
        Invitation invitation = invitationRepository.save(new Invitation(
                student.getTenant(),
                student.getSchool(),
                user,
                UserRole.STUDENT,
                invitationTokenService.hash(rawToken),
                Instant.now().plus(7, ChronoUnit.DAYS)
        ));
        invitationEmailDeliveryService.queueInvitation(invitation, "/invitations/accept?token=" + rawToken);
        return new IssuedInvitation(invitation, rawToken);
    }

    private StudentLoginInvitationResponse toResponse(
            Student student,
            UserAccount user,
            boolean schoolAccessGranted,
            IssuedInvitation issuedInvitation
    ) {
        Invitation invitation = issuedInvitation == null ? null : issuedInvitation.invitation();
        String rawToken = issuedInvitation == null ? null : issuedInvitation.rawToken();
        return new StudentLoginInvitationResponse(
                student.getId(),
                student.getTenant().getId(),
                student.getSchool().getId(),
                user.getId(),
                user.getEmail(),
                user.getStatus(),
                schoolAccessGranted,
                issuedInvitation != null,
                invitation == null ? null : invitation.getId(),
                invitation == null ? null : invitation.getExpiresAt(),
                rawToken,
                rawToken == null ? null : "/invitations/accept?token=" + rawToken
        );
    }

    private StudentSelfProfileResponse toSelfProfileResponse(Student student) {
        return new StudentSelfProfileResponse(
                student.getId(),
                student.getTenant().getId(),
                student.getSchool().getId(),
                student.getAdmissionNumber(),
                student.getFullName(),
                student.getClassLevel() == null ? null : student.getClassLevel().getId(),
                student.getSection() == null ? null : student.getSection().getId(),
                student.getRollNumber(),
                student.getDateOfBirth(),
                student.getGender(),
                student.isActive()
        );
    }

    private void recordStudentLoginInvited(UserAccount actor, Student student, UserAccount user, Invitation invitation) {
        auditLogService.record(
                student.getTenant().getId(),
                student.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.STUDENT_LOGIN_INVITED,
                "Invitation",
                invitation.getId(),
                "Student login invitation created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", student.getTenant().getId(),
                        "schoolId", student.getSchool().getId(),
                        "studentId", student.getId(),
                        "userId", user.getId(),
                        "role", user.getRole().name(),
                        "maskedEmail", maskEmail(user.getEmail()),
                        "expiresAt", invitation.getExpiresAt().toString()
                )
        );
    }

    private void recordStudentLoginEnabled(UserAccount actor, Student student, UserAccount user) {
        auditLogService.record(
                student.getTenant().getId(),
                student.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.STUDENT_LOGIN_ENABLED,
                "Student",
                student.getId(),
                "Student login enabled.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", student.getTenant().getId(),
                        "schoolId", student.getSchool().getId(),
                        "studentId", student.getId(),
                        "userId", user.getId(),
                        "role", user.getRole().name()
                )
        );
    }

    private void recordSchoolAccessGranted(UserAccount actor, Student student, UserAccount user, UserSchoolAccess access) {
        auditLogService.record(
                student.getTenant().getId(),
                student.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.SCHOOL_ACCESS_GRANTED,
                "UserSchoolAccess",
                access.getId(),
                "Student school access granted.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", student.getTenant().getId(),
                        "schoolId", student.getSchool().getId(),
                        "studentId", student.getId(),
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
