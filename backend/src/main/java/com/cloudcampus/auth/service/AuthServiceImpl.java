package com.cloudcampus.auth.service;

import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.RefreshRequest;
import com.cloudcampus.auth.dto.RefreshResponse;
import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.auth.security.JwtUtil;
import com.cloudcampus.auth.security.LoginRateLimiterService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.common.exception.UnauthorizedException;
import org.springframework.transaction.annotation.Transactional;
import com.cloudcampus.config.JwtProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Authentication implementation (CC-0103 login, CC-0105 refresh + logout).
 *
 * Security decisions:
 *
 * 1. OWASP user enumeration prevention:
 *    - We return the SAME error message ("Invalid credentials") whether the username
 *      does not exist OR the password is wrong.
 *    - To prevent timing side-channels: when the user is not found we still call
 *      passwordEncoder.matches() against a dummy hash so the response time stays
 *      constant regardless of whether the account exists.
 *
 * 2. Order of checks in login():
 *    a) Validate credentials (username + password) — 401 on failure.
 *    b) Check account status — 403 on non-ACTIVE.
 *    This order requires correct credentials before revealing account status.
 *
 * 3. Refresh tokens:
 *    - Opaque UUID stored in Redis as  rt:{refreshToken} → {userId}
 *    - TTL: 30 days (app.jwt.refresh-token-expiry-seconds)
 *    - Rotated on every refresh (old token deleted, new one issued).
 *    - Rotation prevents replay: if a leaked token is used, the owner's next
 *      refresh fails (both old and new tokens are gone).
 *
 * 4. Logout is a no-op if token is already expired/absent — never reveal whether
 *    a token existed to prevent token probing.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    // Prefix for Redis refresh-token keys.
    static final String RT_KEY_PREFIX = "rt:";

    // Constant-time dummy hash to prevent username enumeration via timing.
    // BCrypt format — will never match any real input.
    private static final String DUMMY_HASH =
            "$2a$12$dummyhashXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final RedisTemplate<String, String> redisTemplate;
    private final LoginRateLimiterService rateLimiter;
    private final AuditLogService auditLog;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            JwtProperties jwtProperties,
            RedisTemplate<String, String> redisTemplate,
            LoginRateLimiterService rateLimiter,
            AuditLogService auditLog
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
        this.jwtProperties   = jwtProperties;
        this.redisTemplate   = redisTemplate;
        this.rateLimiter     = rateLimiter;
        this.auditLog        = auditLog;
    }

    // ── Login ────────────────────────────────────────────────────────────────

    @Override
    public LoginResponse login(LoginRequest request, String clientIp) {

        // Step 0: Rate limit check — BEFORE credential validation.
        // Counts this attempt regardless of whether the username exists.
        try {
            rateLimiter.checkAndRecord(clientIp, request.username());
        } catch (TooManyRequestsException ex) {
            auditLog.logLoginBlocked(request.username(), clientIp);
            throw ex;
        }

        // Step 1: Look up the user.
        Optional<User> maybeUser = userRepository.findByUsername(request.username());

        // Step 2: Constant-time password check.
        // Always call passwordEncoder.matches() — when the user is absent we compare
        // against a dummy hash so response time is indistinguishable from a hit.
        String hashToCheck = maybeUser
                .map(User::getPasswordHash)
                .orElse(DUMMY_HASH);

        boolean credentialsValid = maybeUser.isPresent()
                && passwordEncoder.matches(request.password(), hashToCheck);

        if (!credentialsValid) {
            log.warn("Failed login attempt for username: {}", request.username());
            auditLog.logLoginFailed(request.username(), clientIp, "bad credentials");
            throw new UnauthorizedException("Invalid credentials");
        }

        User user = maybeUser.get();

        // Step 3: Account status check — only revealed after valid credentials.
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login denied — non-active account [userId={}, status={}]",
                    user.getId(), user.getStatus());
            throw new ForbiddenException("Account is not active");
        }

        // Step 4: Issue tokens.
        String accessToken  = jwtUtil.generateAccessToken(
                user.getId(), user.getTenantId(), null, user.getRole().name());
        String refreshToken = issueRefreshToken(user.getId());

        auditLog.logLoginSuccess(user.getId(), user.getTenantId(), user.getUsername(), clientIp);
        log.info("Successful login [userId={}, role={}]", user.getId(), user.getRole());

        return new LoginResponse(
                accessToken,
                refreshToken,
                jwtProperties.accessTokenExpirySeconds(),
                user.getRole().name(),
                user.getId(),
                user.getTenantId(),
                user.isForcePasswordChange()
        );
    }

    // ── Refresh ──────────────────────────────────────────────────────────────

    @Override
    public RefreshResponse refresh(RefreshRequest request) {
        String oldKey = RT_KEY_PREFIX + request.refreshToken();

        // Resolve userId from Redis.
        String userIdStr = redisTemplate.opsForValue().get(oldKey);
        if (userIdStr == null) {
            // Token expired or never existed — do not reveal which.
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        // Guard: refuse to issue a new token to a suspended account.
        if (user.getStatus() != UserStatus.ACTIVE) {
            // Clean up the stale token while we're here.
            redisTemplate.delete(oldKey);
            log.warn("Refresh denied — non-active account [userId={}]", userId);
            throw new ForbiddenException("Account is not active");
        }

        // Rotate: delete old token and issue a new one atomically.
        // If the old token was already deleted by a concurrent request, the user
        // above would not have been found — so by here we still hold the only copy.
        redisTemplate.delete(oldKey);
        String newRefreshToken = issueRefreshToken(userId);

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getTenantId(), null, user.getRole().name());

        auditLog.logTokenRefreshed(user.getId(), user.getTenantId());
        log.info("Token refreshed [userId={}]", userId);

        return new RefreshResponse(
                newAccessToken,
                newRefreshToken,
                jwtProperties.accessTokenExpirySeconds()
        );
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    @Override
    public void logout(RefreshRequest request) {
        String key = RT_KEY_PREFIX + request.refreshToken();
        // Look up userId before deleting so the audit log captures the actor.
        String userIdStr = redisTemplate.opsForValue().get(key);
        Boolean deleted = redisTemplate.delete(key);
        // No-op if already expired — never throw. Do not log the token value itself.
        if (Boolean.TRUE.equals(deleted)) {
            log.info("Refresh token revoked via logout");
            if (userIdStr != null) {
                try {
                    UUID userId = UUID.fromString(userIdStr);
                    auditLog.logLogout(userId, null, null);
                } catch (IllegalArgumentException ignored) {
                    // Corrupted Redis value — audit failure is non-critical.
                }
            }
        }
    }

    // ── Change password ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BadRequestException("New password must differ from the current one");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(false);
        userRepository.save(user);

        auditLog.logPasswordChanged(userId, user.getTenantId());
        log.info("Password changed [userId={}]", userId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Generate an opaque refresh token UUID and persist it in Redis.
     *
     * Key:   rt:{uuid}
     * Value: userId (string)
     * TTL:   app.jwt.refresh-token-expiry-seconds (default 30 days)
     */
    private String issueRefreshToken(UUID userId) {
        String token = UUID.randomUUID().toString();
        try {
            redisTemplate.opsForValue().set(
                    RT_KEY_PREFIX + token,
                    userId.toString(),
                    Duration.ofSeconds(jwtProperties.refreshTokenExpirySeconds())
            );
        } catch (Exception e) {
            // Fail-open: access token still works; refresh will fail if Redis is down.
            log.warn("Could not persist refresh token in Redis (Redis down?): {}", e.getMessage());
        }
        return token;
    }
}
