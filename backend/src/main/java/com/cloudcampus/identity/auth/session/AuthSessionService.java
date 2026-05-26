package com.cloudcampus.identity.auth.session;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.UserStatus;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthSessionService {

    private static final String TOKEN_TYPE = "Bearer";
    private static final EnumSet<UserRole> MFA_REQUIRED_ROLES = EnumSet.of(
            UserRole.SUPER_ADMIN,
            UserRole.TENANT_ADMIN,
            UserRole.SCHOOL_ADMIN
    );

    private final UserAccountRepository userAccountRepository;
    private final UserSchoolAccessRepository userSchoolAccessRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtAccessTokenService jwtAccessTokenService;
    private final SessionTokenService sessionTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RevokedAccessTokenRepository revokedAccessTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MfaChallengeRepository mfaChallengeRepository;
    private final LoginRateLimiterService loginRateLimiterService;
    private final AuditLogService auditLogService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthSessionService(
            UserAccountRepository userAccountRepository,
            UserSchoolAccessRepository userSchoolAccessRepository,
            SchoolRepository schoolRepository,
            PasswordEncoder passwordEncoder,
            JwtAccessTokenService jwtAccessTokenService,
            SessionTokenService sessionTokenService,
            RefreshTokenRepository refreshTokenRepository,
            RevokedAccessTokenRepository revokedAccessTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            MfaChallengeRepository mfaChallengeRepository,
            LoginRateLimiterService loginRateLimiterService,
            AuditLogService auditLogService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.userSchoolAccessRepository = userSchoolAccessRepository;
        this.schoolRepository = schoolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtAccessTokenService = jwtAccessTokenService;
        this.sessionTokenService = sessionTokenService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.revokedAccessTokenRepository = revokedAccessTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mfaChallengeRepository = mfaChallengeRepository;
        this.loginRateLimiterService = loginRateLimiterService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthSessionResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        loginRateLimiterService.assertLoginAllowed(email);
        UserAccount user;
        try {
            user = findUniqueUserByEmail(email);
        } catch (UnauthorizedException ex) {
            loginRateLimiterService.recordFailure(email);
            throw ex;
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            loginRateLimiterService.recordFailure(email);
            throw new ForbiddenException("User account is not active.");
        }
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            loginRateLimiterService.recordFailure(email);
            throw new UnauthorizedException("Invalid email or password.");
        }

        String activeSchoolId = chooseInitialActiveSchoolId(user.getId());
        loginRateLimiterService.recordSuccess(email);
        if (requiresMfa(user)) {
            return issueMfaChallenge(user);
        }
        return issueSession(user, activeSchoolId, true);
    }

    @Transactional
    public AuthSessionResponse verifyMfa(MfaVerifyRequest request) {
        MfaChallenge challenge = mfaChallengeRepository.findById(request.challengeId())
                .orElseThrow(() -> new UnauthorizedException("MFA challenge is invalid."));
        Instant now = Instant.now();
        if (challenge.getStatus() != MfaChallengeStatus.PENDING) {
            throw new UnauthorizedException("MFA challenge is no longer pending.");
        }
        if (!challenge.getExpiresAt().isAfter(now)) {
            challenge.expire();
            throw new UnauthorizedException("MFA challenge has expired.");
        }
        if (!passwordEncoder.matches(request.code(), challenge.getCodeHash())) {
            challenge.recordFailedAttempt();
            throw new UnauthorizedException("MFA code is invalid.");
        }

        UserAccount user = challenge.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("User account is not active.");
        }
        challenge.markVerified(now);
        recordUserAudit(
                user,
                null,
                AuditAction.MFA_CHALLENGE_VERIFIED,
                "MfaChallenge",
                challenge.getId(),
                "MFA challenge verified",
                Map.of("challengeId", challenge.getId(), "role", user.getRole().name())
        );
        return issueSession(user, chooseInitialActiveSchoolId(user.getId()), true);
    }

    @Transactional
    public AuthSessionResponse refresh(RefreshRequest request) {
        RefreshToken currentToken = refreshTokenRepository.findByTokenHash(sessionTokenService.hash(request.refreshToken()))
                .orElseThrow(() -> new UnauthorizedException("Refresh token is invalid."));
        Instant now = Instant.now();
        if (currentToken.getStatus() != RefreshTokenStatus.ACTIVE || !currentToken.getExpiresAt().isAfter(now)) {
            throw new UnauthorizedException("Refresh token is no longer active.");
        }

        UserAccount user = currentToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("User account is not active.");
        }

        IssuedRefreshToken replacement = issueRefreshToken(user);
        currentToken.rotateTo(replacement.entity(), now);
        recordUserAudit(
                user,
                chooseInitialActiveSchoolId(user.getId()),
                AuditAction.REFRESH_TOKEN_ROTATED,
                "RefreshToken",
                currentToken.getId(),
                "Refresh token rotated",
                Map.of(
                        "refreshTokenId", currentToken.getId(),
                        "replacementRefreshTokenId", replacement.entity().getId(),
                        "role", user.getRole().name()
                )
        );

        return issueSession(user, chooseInitialActiveSchoolId(user.getId()), replacement.rawToken());
    }

    @Transactional
    public AuthMessageResponse logout(AuthenticatedUser authenticatedUser, String accessToken, LogoutRequest request) {
        AuthTokenClaims claims = jwtAccessTokenService.verify(accessToken);
        revokedAccessTokenRepository.save(new RevokedAccessToken(
                sessionTokenService.hash(accessToken),
                authenticatedUser.user(),
                claims.expiresAt(),
                Instant.now()
        ));

        boolean refreshTokenRevoked = false;
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            refreshTokenRepository.findByTokenHash(sessionTokenService.hash(request.refreshToken()))
                    .filter(refreshToken -> refreshToken.getUser().getId().equals(authenticatedUser.user().getId()))
                    .ifPresent(refreshToken -> refreshToken.revoke(Instant.now()));
            refreshTokenRevoked = true;
        }
        recordUserAudit(
                authenticatedUser.user(),
                authenticatedUser.activeSchoolId(),
                AuditAction.USER_LOGGED_OUT,
                "UserAccount",
                authenticatedUser.user().getId(),
                "User logged out",
                Map.of(
                        "userId", authenticatedUser.user().getId(),
                        "role", authenticatedUser.user().getRole().name(),
                        "refreshTokenSupplied", refreshTokenRevoked
                )
        );

        return new AuthMessageResponse("Logged out.");
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        UserAccount user = findUniqueUserByEmail(request.email());
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("User account is not active.");
        }

        String rawToken = sessionTokenService.newRawToken();
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.MINUTES);
        PasswordResetToken resetToken = passwordResetTokenRepository.save(new PasswordResetToken(
                user.getTenant(),
                user,
                sessionTokenService.hash(rawToken),
                expiresAt
        ));
        recordUserAudit(
                user,
                chooseInitialActiveSchoolId(user.getId()),
                AuditAction.PASSWORD_RESET_REQUESTED,
                "PasswordResetToken",
                resetToken.getId(),
                "Password reset requested",
                Map.of(
                        "passwordResetTokenId", resetToken.getId(),
                        "userId", user.getId(),
                        "role", user.getRole().name(),
                        "maskedEmail", maskEmail(user.getEmail())
                )
        );

        return new ForgotPasswordResponse(
                "Password reset token created for scaffold delivery.",
                rawToken,
                expiresAt
        );
    }

    @Transactional
    public AuthMessageResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(sessionTokenService.hash(request.token()))
                .orElseThrow(() -> new UnauthorizedException("Password reset token is invalid."));
        Instant now = Instant.now();
        if (resetToken.getStatus() != PasswordResetTokenStatus.PENDING) {
            throw new BadRequestException("Password reset token is no longer pending.");
        }
        if (!resetToken.getExpiresAt().isAfter(now)) {
            resetToken.expire();
            throw new BadRequestException("Password reset token has expired.");
        }

        UserAccount user = resetToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("User account is not active.");
        }

        user.changePassword(passwordEncoder.encode(request.password()));
        resetToken.markUsed(now);
        recordUserAudit(
                user,
                chooseInitialActiveSchoolId(user.getId()),
                AuditAction.PASSWORD_RESET_COMPLETED,
                "PasswordResetToken",
                resetToken.getId(),
                "Password reset completed",
                Map.of(
                        "passwordResetTokenId", resetToken.getId(),
                        "userId", user.getId(),
                        "role", user.getRole().name()
                )
        );

        return new AuthMessageResponse("Password reset complete.");
    }

    @Transactional
    public AuthMessageResponse changePassword(AuthenticatedUser authenticatedUser, ChangePasswordRequest request) {
        UserAccount user = userAccountRepository.findById(authenticatedUser.user().getId())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user was not found."));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is invalid.");
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        recordUserAudit(
                user,
                authenticatedUser.activeSchoolId(),
                AuditAction.PASSWORD_CHANGED,
                "UserAccount",
                user.getId(),
                "Password changed",
                Map.of("userId", user.getId(), "role", user.getRole().name())
        );
        return new AuthMessageResponse("Password changed.");
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse currentUser(AuthenticatedUser authenticatedUser) {
        return toCurrentUserResponse(authenticatedUser.user(), authenticatedUser.activeSchoolId());
    }

    @Transactional(readOnly = true)
    public List<SchoolAccessResponse> allowedSchools(AuthenticatedUser authenticatedUser) {
        return schoolAccessResponses(authenticatedUser.user());
    }

    @Transactional
    public AuthSessionResponse activateSchool(AuthenticatedUser authenticatedUser, String schoolId) {
        UserAccount user = authenticatedUser.user();
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new NotFoundException("School was not found."));
        if (!school.getTenant().getId().equals(user.getTenant().getId())) {
            throw new ForbiddenException("User cannot activate a school outside their tenant.");
        }

        UserSchoolAccess access = userSchoolAccessRepository.findByUserIdAndSchoolId(user.getId(), schoolId)
                .orElseThrow(() -> new ForbiddenException("User is not assigned to this school."));
        if (!access.getTenant().getId().equals(user.getTenant().getId())
                || !access.getSchool().getTenant().getId().equals(user.getTenant().getId())) {
            throw new ForbiddenException("School access grant tenant scope is invalid.");
        }

        recordUserAudit(
                user,
                access.getSchool().getId(),
                AuditAction.SCHOOL_CONTEXT_ACTIVATED,
                "School",
                access.getSchool().getId(),
                "School context activated",
                Map.of(
                        "schoolId", access.getSchool().getId(),
                        "accessGrantId", access.getId(),
                        "role", user.getRole().name()
                )
        );
        return issueSession(user, access.getSchool().getId(), false);
    }

    private UserAccount findUniqueUserByEmail(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        List<UserAccount> matches = userAccountRepository.findByEmailIgnoreCase(email);
        if (matches.isEmpty()) {
            throw new UnauthorizedException("Invalid email or password.");
        }
        if (matches.size() > 1) {
            throw new BadRequestException("Email login is ambiguous for this scaffold; tenant-qualified login is not implemented.");
        }
        return matches.getFirst();
    }

    private AuthSessionResponse issueMfaChallenge(UserAccount user) {
        String code = "%06d".formatted(secureRandom.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(5, ChronoUnit.MINUTES);
        MfaChallenge challenge = mfaChallengeRepository.save(new MfaChallenge(
                user.getTenant(),
                user,
                passwordEncoder.encode(code),
                expiresAt
        ));
        recordUserAudit(
                user,
                chooseInitialActiveSchoolId(user.getId()),
                AuditAction.MFA_CHALLENGE_CREATED,
                "MfaChallenge",
                challenge.getId(),
                "MFA challenge created",
                Map.of("challengeId", challenge.getId(), "role", user.getRole().name())
        );

        return new AuthSessionResponse(
                null,
                null,
                null,
                null,
                null,
                true,
                challenge.getId(),
                code,
                expiresAt
        );
    }

    private boolean requiresMfa(UserAccount user) {
        return MFA_REQUIRED_ROLES.contains(user.getRole());
    }

    private String normalizeEmail(String rawEmail) {
        return rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private AuthSessionResponse issueSession(UserAccount user, String activeSchoolId, boolean includeRefreshToken) {
        String refreshToken = null;
        if (includeRefreshToken) {
            refreshToken = issueRefreshToken(user).rawToken();
        }
        return issueSession(user, activeSchoolId, refreshToken);
    }

    private AuthSessionResponse issueSession(UserAccount user, String activeSchoolId, String refreshToken) {
        String token = jwtAccessTokenService.issueToken(
                user.getId(),
                user.getTenant().getId(),
                user.getRole(),
                activeSchoolId
        );
        return new AuthSessionResponse(
                token,
                refreshToken,
                TOKEN_TYPE,
                jwtAccessTokenService.expiresAt(token),
                toCurrentUserResponse(user, activeSchoolId),
                false,
                null,
                null,
                null
        );
    }

    private CurrentUserResponse toCurrentUserResponse(UserAccount user, String activeSchoolId) {
        List<SchoolAccessResponse> allowedSchools = schoolAccessResponses(user);
        SchoolAccessResponse activeSchool = allowedSchools.stream()
                .filter(access -> access.schoolId().equals(activeSchoolId))
                .findFirst()
                .orElse(null);

        return new CurrentUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getTenant().getId(),
                activeSchool,
                allowedSchools
        );
    }

    private List<SchoolAccessResponse> schoolAccessResponses(UserAccount user) {
        String tenantId = user.getTenant().getId();
        return userSchoolAccessRepository.findByUserId(user.getId())
                .stream()
                .filter(access -> access.getTenant().getId().equals(tenantId))
                .filter(access -> access.getSchool().getTenant().getId().equals(tenantId))
                .sorted(Comparator
                        .comparing(UserSchoolAccess::isPrimaryAccess).reversed()
                        .thenComparing(access -> access.getSchool().getName()))
                .map(this::toSchoolAccessResponse)
                .toList();
    }

    private SchoolAccessResponse toSchoolAccessResponse(UserSchoolAccess access) {
        return new SchoolAccessResponse(
                access.getSchool().getId(),
                access.getSchool().getCode(),
                access.getSchool().getName(),
                access.getRole(),
                access.isPrimaryAccess()
        );
    }

    private String chooseInitialActiveSchoolId(String userId) {
        return userSchoolAccessRepository.findByUserId(userId)
                .stream()
                .filter(UserSchoolAccess::isPrimaryAccess)
                .findFirst()
                .or(() -> userSchoolAccessRepository.findByUserId(userId).stream().findFirst())
                .map(access -> access.getSchool().getId())
                .orElse(null);
    }

    private IssuedRefreshToken issueRefreshToken(UserAccount user) {
        String rawToken = sessionTokenService.newRawToken();
        RefreshToken refreshToken = refreshTokenRepository.save(new RefreshToken(
                user.getTenant(),
                user,
                sessionTokenService.hash(rawToken),
                Instant.now().plus(7, ChronoUnit.DAYS)
        ));
        return new IssuedRefreshToken(rawToken, refreshToken);
    }

    private record IssuedRefreshToken(String rawToken, RefreshToken entity) {
    }

    private void recordUserAudit(
            UserAccount user,
            String schoolId,
            AuditAction action,
            String entityType,
            String entityId,
            String summary,
            Map<String, ?> metadata
    ) {
        auditLogService.record(
                user.getTenant().getId(),
                schoolId,
                user.getRole().name(),
                user.getId(),
                action,
                entityType,
                entityId,
                summary,
                metadata
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
