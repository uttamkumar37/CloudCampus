package com.cloudcampus.people.parent;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
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
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParentLinkService {

    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final UserAccountRepository userAccountRepository;
    private final InvitationRepository invitationRepository;
    private final InvitationTokenService invitationTokenService;
    private final SchoolAccessService schoolAccessService;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final AuditLogService auditLogService;
    private final InvitationEmailDeliveryService invitationEmailDeliveryService;

    public ParentLinkService(
            StudentRepository studentRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            UserAccountRepository userAccountRepository,
            InvitationRepository invitationRepository,
            InvitationTokenService invitationTokenService,
            SchoolAccessService schoolAccessService,
            UserSchoolAccessRepository userSchoolAccessRepository,
            AuditLogService auditLogService,
            InvitationEmailDeliveryService invitationEmailDeliveryService
    ) {
        this.studentRepository = studentRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.userAccountRepository = userAccountRepository;
        this.invitationRepository = invitationRepository;
        this.invitationTokenService = invitationTokenService;
        this.schoolAccessService = schoolAccessService;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.auditLogService = auditLogService;
        this.invitationEmailDeliveryService = invitationEmailDeliveryService;
    }

    @Transactional
    public ParentLinkResponse linkParent(AuthenticatedUser actor, ParentLinkRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), student.getSchool().getId());

        String email = normalizeEmail(request.parentEmail());
        String mobile = normalizeOptional(request.parentMobile());
        UserAccount parent = findOrCreateParent(student, request.parentFullName(), email);
        if (parent.getRole() != UserRole.PARENT) {
            throw new ConflictException("The existing user for this email is not a parent.");
        }
        grantParentSchoolAccessIfMissing(student, parent);
        if (parentStudentLinkRepository.existsByParentUserIdAndStudentId(parent.getId(), student.getId())) {
            throw new ConflictException("Parent is already linked to this student.");
        }

        ParentStudentLink link = parentStudentLinkRepository.save(new ParentStudentLink(
                student.getTenant(),
                student.getSchool(),
                student,
                parent,
                request.relationship().trim(),
                email,
                mobile,
                request.primaryContact()
        ));

        IssuedInvitation issuedInvitation = null;
        if (parent.getStatus() != UserStatus.ACTIVE) {
            issuedInvitation = inviteParent(parent, student);
            recordParentInvited(actor.user(), parent, student, issuedInvitation.invitation());
        }
        recordParentLinked(actor.user(), parent, student, link);

        return toParentLinkResponse(link, issuedInvitation);
    }

    @Transactional(readOnly = true)
    public List<ParentChildResponse> children(AuthenticatedUser parentUser) {
        requireParent(parentUser);
        String tenantId = parentUser.user().getTenant().getId();
        String activeSchoolId = requireActiveParentSchool(parentUser);
        return parentStudentLinkRepository.findByParentUserId(parentUser.user().getId())
                .stream()
                .filter(link -> tenantConsistent(link, tenantId))
                .filter(link -> link.getSchool().getId().equals(activeSchoolId))
                .sorted(Comparator.comparing(link -> link.getStudent().getFullName()))
                .map(this::toParentChildResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ParentChildResponse child(AuthenticatedUser parentUser, String studentId) {
        requireParent(parentUser);
        String tenantId = parentUser.user().getTenant().getId();
        String activeSchoolId = requireActiveParentSchool(parentUser);
        ParentStudentLink link = parentStudentLinkRepository
                .findByParentUserIdAndStudentId(parentUser.user().getId(), studentId)
                .filter(candidate -> tenantConsistent(candidate, tenantId))
                .filter(candidate -> candidate.getSchool().getId().equals(activeSchoolId))
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
        return toParentChildResponse(link);
    }

    private UserAccount findOrCreateParent(Student student, String fullName, String email) {
        return userAccountRepository.findByTenantIdAndEmail(student.getTenant().getId(), email)
                .orElseGet(() -> userAccountRepository.save(new UserAccount(
                        student.getTenant(),
                        email,
                        fullName.trim(),
                        UserRole.PARENT
                )));
    }

    private IssuedInvitation inviteParent(UserAccount parent, Student student) {
        String rawToken = invitationTokenService.newRawToken();
        Invitation invitation = invitationRepository.save(new Invitation(
                student.getTenant(),
                student.getSchool(),
                parent,
                UserRole.PARENT,
                invitationTokenService.hash(rawToken),
                Instant.now().plus(7, ChronoUnit.DAYS)
        ));
        invitationEmailDeliveryService.queueInvitation(invitation, "/invitations/accept?token=" + rawToken);
        return new IssuedInvitation(invitation, rawToken);
    }

    private void grantParentSchoolAccessIfMissing(Student student, UserAccount parent) {
        var existingAccess = userSchoolAccessRepository.findByUserIdAndSchoolId(parent.getId(), student.getSchool().getId());
        if (existingAccess.isPresent()) {
            UserSchoolAccess access = existingAccess.get();
            if (access.getRole() != UserRole.PARENT) {
                throw new ConflictException("Existing school access role does not match the parent role.");
            }
            if (!access.getTenant().getId().equals(parent.getTenant().getId())
                    || !access.getSchool().getTenant().getId().equals(parent.getTenant().getId())) {
                throw new ForbiddenException("School access grant tenant scope is invalid.");
            }
            return;
        }
        userSchoolAccessRepository.save(new UserSchoolAccess(
                student.getTenant(),
                student.getSchool(),
                parent,
                UserRole.PARENT,
                userSchoolAccessRepository.findByUserId(parent.getId()).isEmpty()
        ));
    }

    private ParentLinkResponse toParentLinkResponse(ParentStudentLink link, IssuedInvitation issuedInvitation) {
        Invitation invitation = issuedInvitation == null ? null : issuedInvitation.invitation();
        String rawToken = issuedInvitation == null ? null : issuedInvitation.rawToken();
        return new ParentLinkResponse(
                link.getId(),
                link.getTenant().getId(),
                link.getSchool().getId(),
                link.getStudent().getId(),
                link.getStudent().getFullName(),
                link.getParentUser().getId(),
                link.getParentUser().getEmail(),
                link.getRelationship(),
                link.isPrimaryContact(),
                issuedInvitation != null,
                invitation == null ? null : invitation.getId(),
                invitation == null ? null : invitation.getExpiresAt(),
                rawToken,
                rawToken == null ? null : "/invitations/accept?token=" + rawToken
        );
    }

    private ParentChildResponse toParentChildResponse(ParentStudentLink link) {
        Student student = link.getStudent();
        return new ParentChildResponse(
                link.getId(),
                link.getTenant().getId(),
                link.getSchool().getId(),
                student.getId(),
                student.getFullName(),
                student.getAdmissionNumber(),
                link.getRelationship(),
                link.isPrimaryContact()
        );
    }

    private void requireParent(AuthenticatedUser authenticatedUser) {
        if (authenticatedUser.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Parent access is required.");
        }
    }

    private String requireActiveParentSchool(AuthenticatedUser authenticatedUser) {
        String activeSchoolId = authenticatedUser.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required for parent access.");
        }
        return activeSchoolId;
    }

    private boolean tenantConsistent(ParentStudentLink link, String tenantId) {
        return link.getTenant().getId().equals(tenantId)
                && link.getSchool().getTenant().getId().equals(tenantId)
                && link.getStudent().getTenant().getId().equals(tenantId)
                && link.getParentUser().getTenant().getId().equals(tenantId);
    }

    private void recordParentInvited(UserAccount actor, UserAccount parent, Student student, Invitation invitation) {
        auditLogService.record(
                student.getTenant().getId(),
                student.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.PARENT_INVITED,
                "Invitation",
                invitation.getId(),
                "Parent invitation created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", student.getTenant().getId(),
                        "schoolId", student.getSchool().getId(),
                        "studentId", student.getId(),
                        "parentUserId", parent.getId(),
                        "maskedEmail", maskEmail(parent.getEmail()),
                        "role", parent.getRole().name(),
                        "expiresAt", invitation.getExpiresAt().toString()
                )
        );
    }

    private void recordParentLinked(UserAccount actor, UserAccount parent, Student student, ParentStudentLink link) {
        auditLogService.record(
                student.getTenant().getId(),
                student.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.PARENT_LINKED,
                "ParentStudentLink",
                link.getId(),
                "Parent linked to student.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", student.getTenant().getId(),
                        "schoolId", student.getSchool().getId(),
                        "studentId", student.getId(),
                        "parentUserId", parent.getId(),
                        "relationship", link.getRelationship(),
                        "primaryContact", link.isPrimaryContact()
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
