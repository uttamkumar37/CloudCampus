package com.cloudcampus.auth.controller;

import com.cloudcampus.auth.dto.ChangePasswordRequest;
import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.SendOtpRequest;
import com.cloudcampus.auth.dto.UpdateCredentialsRequest;
import com.cloudcampus.auth.service.AuthService;
import com.cloudcampus.auth.service.CredentialsUpdateService;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import com.cloudcampus.auth.dto.UserProfileResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;
    private final CredentialsUpdateService credentialsUpdateService;

    @Value("${app.security.jwt.access-token-expiration-ms:3600000}")
    private long jwtExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    @Operation(summary = "Login and obtain JWT access token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse) {
        LoginResponse response = authService.login(request);
        ResponseCookie cookie = ResponseCookie.from("app_jwt", response.accessToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtExpirationMs / 1000)
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and expire the HttpOnly auth cookie")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse httpResponse) {
        ResponseCookie expired = ResponseCookie.from("app_jwt", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, expired.toString());
        return ResponseEntity.ok(ApiResponse.success("Logged out", null));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me() {
        return ResponseEntity.ok(ApiResponse.success("Profile loaded", authService.currentProfile()));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password for the authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/credentials/send-otp")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Send OTP for credential update (email or SMS)")
    public ResponseEntity<ApiResponse<Void>> sendCredentialOtp(
            @Valid @RequestBody SendOtpRequest request) {
        credentialsUpdateService.sendOtpForCredentialUpdate(requireCurrentUserId(), request.channel());
        return ResponseEntity.ok(ApiResponse.success("OTP sent", null));
    }

    @PostMapping("/credentials/update")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verify OTP and update username/password")
    public ResponseEntity<ApiResponse<Void>> updateCredentials(
            @Valid @RequestBody UpdateCredentialsRequest request) {
        credentialsUpdateService.verifyOtpAndUpdateCredentials(
                requireCurrentUserId(),
                request.channel(),
                request.otp(),
                request.newUsername(),
                request.newPassword()
        );
        return ResponseEntity.ok(ApiResponse.success("Credentials updated successfully", null));
    }

    private UUID requireCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails campus) || campus.getUserId() == null) {
            throw new IllegalStateException("Authenticated tenant user is required");
        }
        return campus.getUserId();
    }
}
