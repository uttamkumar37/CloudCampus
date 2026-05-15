package com.cloudcampus.auth.controller;

import com.cloudcampus.auth.dto.ChangePasswordRequest;
import com.cloudcampus.auth.dto.ForgotPasswordRequest;
import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.RefreshRequest;
import com.cloudcampus.auth.dto.RefreshResponse;
import com.cloudcampus.auth.dto.ResetPasswordRequest;
import com.cloudcampus.auth.service.AuthService;
import com.cloudcampus.auth.service.PasswordResetService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints (CC-0103, CC-0105).
 *
 * POST /v1/auth/login   — username/password → JWT pair + refresh token
 * POST /v1/auth/refresh — refresh token → new JWT pair (token rotated)
 * POST /v1/auth/logout  — invalidate refresh token in Redis
 *
 * All endpoints are publicly accessible — the /v1/auth/** permitAll rule in
 * SecurityConfig allows unauthenticated access. This is correct by design.
 */
@RestController
@RequestMapping("/v1/auth")
@Tag(name = "Authentication", description = "Login, token refresh, logout, and password reset")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    /**
     * Authenticate with username and password.
     *
     * On success:            200 with accessToken + refreshToken.
     * Rate limit exceeded:   429 (TooManyRequestsException).
     * Bad credentials:       401 (UnauthorizedException — generic message, no field hint).
     * Suspended account:     403 (ForbiddenException).
     * Validation failure:    400 (@Valid).
     *
     * SECURITY: Never log or include request.password() in any output.
     */
    @Operation(summary = "Login", description = "Authenticate with username and password. Returns JWT access token and refresh token.")
    @SecurityRequirements  // no auth required — public endpoint
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String clientIp = extractClientIp(httpRequest);
        LoginResponse body = authService.login(request, clientIp);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    /**
     * Exchange a refresh token for a new access token.
     *
     * On success:            200 with new accessToken and rotated refreshToken.
     *                        Client MUST replace stored refresh token with the new one.
     * Unknown/expired token: 401.
     * Suspended account:     403.
     *
     * Token rotation: the submitted refresh token is deleted from Redis and a new
     * one is issued. This limits the damage window if a token is leaked.
     */
    @Operation(summary = "Refresh token", description = "Exchange a refresh token for a new JWT pair. The submitted refresh token is rotated.")
    @SecurityRequirements  // no auth required — public endpoint
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        RefreshResponse body = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    /**
     * Invalidate the refresh token (logout).
     *
     * On success (or token already expired): 204 No Content.
     * The access token is short-lived (15 min) and will self-expire.
     *
     * SECURITY: Never throw on an already-absent token — prevents token probing.
     */
    @Operation(summary = "Logout", description = "Invalidate the refresh token. Access token expires on its own TTL (15 min).")
    @SecurityRequirements  // no auth required — token may already be expired
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Valid @RequestBody RefreshRequest request
    ) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Change the authenticated user's own password.
     *
     * Requires a valid JWT — this endpoint is NOT in the /v1/auth/** permitAll block.
     * Any role (STUDENT, TEACHER, SCHOOL_ADMIN, SUPER_ADMIN, PARENT) may call this.
     *
     * On success:               204 No Content.
     * Wrong current password:   400 (BadRequestException).
     * New == current:           400 (BadRequestException).
     */
    @Operation(summary = "Change password", description = "Change the authenticated user's password. Requires the current password for verification.")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(
                RequestContext.getUserId(),
                request.currentPassword(),
                request.newPassword()
        );
        return ResponseEntity.noContent().build();
    }

    /**
     * Revoke all active refresh tokens for the authenticated user (CC-0117).
     *
     * Signs the user out of every device simultaneously. The current access token
     * remains valid until its natural 15-minute expiry — the client should discard
     * it immediately and redirect to the login screen.
     *
     * On success: 204 No Content + revokedCount header.
     */
    @Operation(
            summary = "Sign out from all devices",
            description = "Invalidates all active refresh tokens for the current user. Use this to revoke access from lost or compromised devices."
    )
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/revoke-all")
    public ResponseEntity<Void> revokeAllSessions(HttpServletRequest httpRequest) {
        String tenantIdStr = RequestContext.getTenantId();
        UUID tenantId = tenantIdStr != null ? UUID.fromString(tenantIdStr) : null;
        int revoked = authService.revokeAllSessions(
                RequestContext.getUserId(),
                tenantId,
                extractClientIp(httpRequest)
        );
        return ResponseEntity.noContent()
                .header("X-Revoked-Sessions", String.valueOf(revoked))
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Initiate a password reset. A 6-digit OTP will be sent to the email.
     *
     * Always returns 200 regardless of whether the email is registered
     * (OWASP user enumeration prevention).
     */
    @Operation(
            summary = "Forgot password",
            description = "Send a 6-digit OTP to the email address. Always returns 200 to prevent user enumeration."
    )
    @SecurityRequirements  // public — no bearer token required
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        passwordResetService.requestReset(request.email());
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }

    /**
     * Verify the OTP and set a new password.
     *
     * On success:           200.
     * Wrong / expired OTP: 400.
     */
    @Operation(
            summary = "Reset password",
            description = "Verify the OTP received by email and set a new password."
    )
    @SecurityRequirements  // public — no bearer token required
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        passwordResetService.resetPassword(request.email(), request.otp(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Extract the real client IP, respecting reverse-proxy headers.
     *
     * Priority: X-Forwarded-For (first entry) → X-Real-IP → remoteAddr.
     *
     * SECURITY NOTE: X-Forwarded-For can be spoofed by clients if your reverse proxy
     * does not strip/override it. In production, ensure your load balancer sets this
     * header and clients cannot inject arbitrary values.
     */
    private static String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // Format: "client, proxy1, proxy2" — take the leftmost (original client).
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri.trim();
        }
        return request.getRemoteAddr();
    }
}
