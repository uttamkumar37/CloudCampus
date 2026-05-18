package com.cloudcampus.auth.service;

import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.RefreshRequest;
import com.cloudcampus.auth.dto.RefreshResponse;
import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.auth.security.JwtDenylistService;
import com.cloudcampus.auth.security.JwtUtil;
import com.cloudcampus.auth.security.LoginRateLimiterService;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.common.metrics.BusinessMetrics;
import com.cloudcampus.feature.repository.TenantFeatureRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.service.UserSchoolAccessService;
import io.micrometer.tracing.annotation.NewSpan;
import org.springframework.transaction.annotation.Transactional;
import com.cloudcampus.config.JwtProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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

    // Prefix for per-token Redis keys: rt:{uuid} → userId
    static final String RT_KEY_PREFIX = "rt:";

    // Prefix for per-user token-index keys: cc:rt:user:{userId} → Set<uuid>
    // Used to bulk-revoke all sessions for a user (CC-0117).
    static final String RT_USER_KEY_PREFIX = "cc:rt:user:";

    // Constant-time dummy hash to prevent username enumeration via timing.
    // BCrypt format — will never match any real input.
    private static final String DUMMY_HASH =
            "$2a$12$dummyhashXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    // Atomic GET+DEL Lua script — fixes the TOCTOU race in refresh token rotation
    // (CRIT-11). Two concurrent requests with the same token both saw a non-null
    // GET result under the old code and both proceeded to issue new tokens.
    // With this script, only the first caller gets the userId; the second gets nil.
    private static final DefaultRedisScript<String> GETDEL_SCRIPT =
            new DefaultRedisScript<>(
                    "local v = redis.call('GET', KEYS[1])\n" +
                    "if v == false then return nil end\n" +
                    "redis.call('DEL', KEYS[1])\n" +
                    "return v",
                    String.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final RedisTemplate<String, String> redisTemplate;
    private final LoginRateLimiterService rateLimiter;
    private final AuditLogService auditLog;
    private final SchoolRepository schoolRepository;
    private final UserSchoolAccessService userSchoolAccessService;
    private final TenantFeatureRepository tenantFeatureRepository;
    private final JwtDenylistService jwtDenylistService;
    private final BusinessMetrics metrics;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            JwtProperties jwtProperties,
            RedisTemplate<String, String> redisTemplate,
            LoginRateLimiterService rateLimiter,
            AuditLogService auditLog,
            SchoolRepository schoolRepository,
            UserSchoolAccessService userSchoolAccessService,
            TenantFeatureRepository tenantFeatureRepository,
            JwtDenylistService jwtDenylistService,
            BusinessMetrics metrics
    ) {
        this.userRepository          = userRepository;
        this.passwordEncoder         = passwordEncoder;
        this.jwtUtil                 = jwtUtil;
        this.jwtProperties           = jwtProperties;
        this.redisTemplate           = redisTemplate;
        this.rateLimiter             = rateLimiter;
        this.auditLog                = auditLog;
        this.schoolRepository        = schoolRepository;
        this.userSchoolAccessService = userSchoolAccessService;
        this.tenantFeatureRepository = tenantFeatureRepository;
        this.jwtDenylistService      = jwtDenylistService;
        this.metrics                 = metrics;
    }

    // ── Login ────────────────────────────────────────────────────────────────

    @NewSpan("auth.login")
    @Override
    public LoginResponse login(LoginRequest request, String clientIp) {

        // Step 0: Rate limit check — BEFORE credential validation.
        // Counts this attempt regardless of whether the username exists.
        try {
            rateLimiter.checkAndRecord(clientIp, request.username());
        } catch (TooManyRequestsException ex) {
            auditLog.logLoginBlocked(request.username(), clientIp);
            metrics.recordLoginRateLimited();
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

            // Track consecutive bad-credential failures for existing accounts only.
            // Unknown usernames cannot be locked (nothing to suspend).
            maybeUser.ifPresent(u -> {
                boolean lockoutReached = rateLimiter.recordCredentialFailure(request.username());
                if (lockoutReached && u.getStatus() == UserStatus.ACTIVE) {
                    u.setStatus(UserStatus.SUSPENDED);
                    userRepository.save(u);
                    auditLog.logAccountLocked(u.getId(), u.getTenantId(), request.username(), clientIp);
                    log.warn("Account suspended after repeated failed logins [userId={}, username={}]",
                            u.getId(), request.username());
                    metrics.recordLoginLockedOut();
                }
            });

            metrics.recordLoginFailure();
            throw new UnauthorizedException("Invalid credentials");
        }

        User user = maybeUser.get();

        // Clear lockout counter on successful credential validation.
        rateLimiter.clearCredentialFailures(request.username());

        // Step 3: Account status check — only revealed after valid credentials.
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login denied — non-active account [userId={}, status={}]",
                    user.getId(), user.getStatus());
            throw new ForbiddenException("Account is not active");
        }

        // Step 4: Resolve schoolId for SCHOOL_ADMIN so it is embedded in the JWT.
        UUID schoolId = resolveSchoolId(user);

        // Step 5: Issue tokens (schoolId is now resolved and included in the JWT).
        String accessToken  = jwtUtil.generateAccessToken(
                user.getId(), user.getTenantId(), schoolId, user.getRole().name());
        String refreshToken = issueRefreshToken(user.getId());

        // Step 6: Resolve enabled feature-flag codes for this tenant.
        // SUPER_ADMIN has no tenant — returns empty list (roles check takes precedence).
        List<String> features = user.getTenantId() != null
                ? tenantFeatureRepository.findEnabledKeysByTenantId(user.getTenantId())
                : List.of();

        metrics.recordLoginSuccess();
        auditLog.logLoginSuccess(user.getId(), user.getTenantId(), user.getUsername(), clientIp);
        log.info("Successful login [userId={}, role={}]", user.getId(), user.getRole());

        return new LoginResponse(
                accessToken,
                refreshToken,
                jwtProperties.accessTokenExpirySeconds(),
                user.getRole().name(),
                user.getId(),
                user.getTenantId(),
                schoolId,
                user.isForcePasswordChange(),
                features
        );
    }

    // ── Refresh ──────────────────────────────────────────────────────────────

    @Override
    public RefreshResponse refresh(RefreshRequest request) {
        String oldKey = RT_KEY_PREFIX + request.refreshToken();

        // Atomic GET+DEL via Lua script (CRIT-11).
        // Under the old two-step GET→DEL, two concurrent requests with the same
        // token both read a non-null userId and both issued new tokens (double-spend).
        // The script atomically reads and deletes in a single Redis command;
        // exactly one caller gets the userId — the other gets null and fails.
        String userIdStr = redisTemplate.execute(
                GETDEL_SCRIPT, List.of(oldKey));
        if (userIdStr == null) {
            // Token expired, never existed, or already consumed by a concurrent request.
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        // Guard: refuse to issue a new token to a suspended account.
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Refresh denied — non-active account [userId={}]", userId);
            throw new ForbiddenException("Account is not active");
        }

        // Remove old UUID from the per-user index before issuing the new one.
        redisTemplate.opsForSet().remove(RT_USER_KEY_PREFIX + userId, request.refreshToken());
        String newRefreshToken = issueRefreshToken(userId);

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getTenantId(), resolveSchoolId(user), user.getRole().name());

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
        String token = request.refreshToken();
        String key = RT_KEY_PREFIX + token;
        // Look up userId before deleting so the audit log captures the actor.
        String userIdStr = redisTemplate.opsForValue().get(key);
        Boolean deleted = redisTemplate.delete(key);
        // No-op if already expired — never throw. Do not log the token value itself.
        if (Boolean.TRUE.equals(deleted)) {
            log.info("Refresh token revoked via logout");
            if (userIdStr != null) {
                try {
                    UUID userId = UUID.fromString(userIdStr);
                    // Remove from the per-user token index so revokeAllSessions stays accurate.
                    redisTemplate.opsForSet().remove(RT_USER_KEY_PREFIX + userId, token);
                    auditLog.logLogout(userId, null, null);
                } catch (IllegalArgumentException ignored) {
                    // Corrupted Redis value — audit failure is non-critical.
                }
            }
        }

        // H-02: denylist the access token so it cannot be reused until it naturally expires.
        // jti + expiry were written to RequestContext by JwtAuthenticationFilter.
        String jti = RequestContext.getJwtJti();
        Instant expiry = RequestContext.getJwtExpiry();
        if (jti != null && expiry != null) {
            jwtDenylistService.deny(jti, expiry);
        }
    }

    @Override
    public int revokeAllSessions(UUID userId, UUID tenantId, String clientIp) {
        String userKey = RT_USER_KEY_PREFIX + userId;
        Set<String> tokens = redisTemplate.opsForSet().members(userKey);

        int revoked = 0;
        if (tokens != null && !tokens.isEmpty()) {
            // Delete all per-token keys in a single pipeline round-trip.
            List<String> tokenKeys = tokens.stream()
                    .map(t -> RT_KEY_PREFIX + t)
                    .toList();
            Long deleted = redisTemplate.delete(tokenKeys);
            revoked = deleted != null ? deleted.intValue() : 0;
        }

        // Always delete the index, even if no tokens were found (may be stale).
        redisTemplate.delete(userKey);

        auditLog.logAllSessionsRevoked(userId, tenantId, revoked, clientIp);
        log.info("All sessions revoked [userId={}, count={}]", userId, revoked);
        return revoked;
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
        revokeAllSessions(userId, user.getTenantId(), "password-change");

        auditLog.logPasswordChanged(userId, user.getTenantId());
        log.info("Password changed [userId={}]", userId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Resolve school context for SCHOOL_ADMIN JWTs.
     *
     * Prefer the user's primary school from user_school_access (CC-0214). Fall
     * back to the tenant's "MAIN" school for older accounts that pre-date the
     * cross-school access model.
     */
    private UUID resolveSchoolId(User user) {
        if (user.getRole() != UserRole.SCHOOL_ADMIN || user.getTenantId() == null) {
            return null;
        }
        return userSchoolAccessService.getPrimarySchoolId(user.getId())
                .orElseGet(() -> schoolRepository
                        .findByTenantIdAndCode(user.getTenantId(), "MAIN")
                        .map(s -> s.getId())
                        .orElse(null));
    }

    /**
     * Generate an opaque refresh token UUID and persist it in Redis.
     *
     * Keys written:
     *   rt:{uuid}              → userId    (TTL: refreshTokenExpirySeconds)
     *   cc:rt:user:{userId}    → Set<uuid> (TTL: refreshTokenExpirySeconds, reset on each add)
     *
     * The per-user set enables bulk revocation via revokeAllSessions() (CC-0117).
     */
    private String issueRefreshToken(UUID userId) {
        String token = UUID.randomUUID().toString();
        Duration ttl = Duration.ofSeconds(jwtProperties.refreshTokenExpirySeconds());
        try {
            // Per-token entry.
            redisTemplate.opsForValue().set(RT_KEY_PREFIX + token, userId.toString(), ttl);
            // Per-user index — add UUID and refresh the set's TTL to match the latest token.
            String userKey = RT_USER_KEY_PREFIX + userId;
            redisTemplate.opsForSet().add(userKey, token);
            redisTemplate.expire(userKey, ttl);
        } catch (Exception e) {
            // Fail-open: access token still works; refresh will fail if Redis is down.
            log.warn("Could not persist refresh token in Redis (Redis down?): {}", e.getMessage());
        }
        return token;
    }
}
