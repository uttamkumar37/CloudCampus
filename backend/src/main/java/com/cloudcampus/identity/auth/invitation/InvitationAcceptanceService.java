package com.cloudcampus.identity.auth.invitation;

import java.time.Instant;
import java.util.Map;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvitationAcceptanceService {

    private final InvitationRepository invitationRepository;
    private final InvitationTokenService invitationTokenService;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public InvitationAcceptanceService(
            InvitationRepository invitationRepository,
            InvitationTokenService invitationTokenService,
            UserSchoolAccessRepository userSchoolAccessRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService
    ) {
        this.invitationRepository = invitationRepository;
        this.invitationTokenService = invitationTokenService;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AcceptInvitationResponse accept(AcceptInvitationRequest request) {
        String tokenHash = invitationTokenService.hash(request.token());
        Invitation invitation = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new NotFoundException("Invitation token was not found."));

        Instant now = Instant.now();
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is no longer pending.");
        }
        if (invitation.getExpiresAt().isBefore(now)) {
            invitation.expire();
            throw new BadRequestException("Invitation has expired.");
        }

        UserAccount user = invitation.getUser();
        user.activate(passwordEncoder.encode(request.password()), request.displayName(), now);
        invitation.accept(now);

        boolean hasSchoolAccess = userSchoolAccessRepository.existsByUserIdAndSchoolId(
                user.getId(),
                invitation.getSchool().getId()
        );
        auditLogService.record(
                invitation.getTenant().getId(),
                invitation.getSchool().getId(),
                user.getRole().name(),
                user.getId(),
                AuditAction.INVITATION_ACCEPTED,
                "Invitation",
                invitation.getId(),
                "Invitation accepted",
                Map.of(
                        "invitationId", invitation.getId(),
                        "userId", user.getId(),
                        "role", user.getRole().name(),
                        "schoolAccessGranted", hasSchoolAccess,
                        "maskedEmail", maskEmail(user.getEmail())
                )
        );

        return new AcceptInvitationResponse(
                user.getId(),
                invitation.getTenant().getId(),
                invitation.getSchool().getId(),
                user.getRole(),
                user.getStatus(),
                hasSchoolAccess
        );
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***" + (at >= 0 ? email.substring(at) : "");
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
