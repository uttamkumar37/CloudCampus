package com.cloudcampus.auth.service;

import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.RefreshRequest;
import com.cloudcampus.auth.dto.RefreshResponse;

/**
 * Authentication operations: login, refresh, and logout.
 *
 * CC-0103 — login
 * CC-0105 — refresh + logout (A3)
 */
public interface AuthService {

    /**
     * Authenticate a user by username and password.
     *
     * Rate limiting is applied BEFORE credential validation to prevent both
     * brute-force attacks and user enumeration via the rate-limit response.
     *
     * @param request  login credentials
     * @param clientIp caller's IP address (for per-IP rate limiting)
     *
     * Throws:
     *   - {@link com.cloudcampus.common.exception.TooManyRequestsException} (429)
     *     when the per-IP or per-username rate limit is exceeded.
     *   - {@link com.cloudcampus.common.exception.UnauthorizedException} (401)
     *     when credentials are invalid. Message is intentionally vague.
     *   - {@link com.cloudcampus.common.exception.ForbiddenException} (403)
     *     when the account is not in ACTIVE status.
     */
    LoginResponse login(LoginRequest request, String clientIp);

    /**
     * Exchange a valid refresh token for a new access token.
     *
     * Implements refresh-token rotation: the old token is deleted from Redis and
     * a new one is issued atomically. This prevents replay attacks — if a leaked
     * token is used, the legitimate user's next refresh will fail (both tokens gone).
     *
     * Throws:
     *   - {@link com.cloudcampus.common.exception.UnauthorizedException} (401)
     *     when the refresh token is unknown, expired, or the user no longer exists.
     */
    RefreshResponse refresh(RefreshRequest request);

    /**
     * Invalidate a refresh token (logout).
     *
     * Deletes the Redis key rt:{refreshToken}, making the token permanently unusable.
     * If the token is already gone (expired or already used), this is a no-op — never
     * throw on missing tokens to avoid leaking token existence information.
     */
    void logout(RefreshRequest request);

    /**
     * Change the authenticated user's password.
     *
     * Verifies currentPassword against the stored BCrypt hash, then replaces it.
     * Throws BadRequestException if currentPassword is wrong or newPassword equals
     * the current one.
     */
    void changePassword(java.util.UUID userId, String currentPassword, String newPassword);

    /**
     * Invalidate every active refresh token for the given user (CC-0117).
     *
     * Deletes all entries in the per-user Redis token index (cc:rt:user:{userId})
     * and their corresponding rt:{uuid} keys. The current session's access token
     * remains valid until its natural expiry (max 15 min).
     *
     * @param userId    the user whose sessions should be revoked
     * @param tenantId  for audit logging
     * @param clientIp  for audit logging
     * @return number of refresh tokens invalidated
     */
    int revokeAllSessions(java.util.UUID userId, java.util.UUID tenantId, String clientIp);
}
