package com.cloudcampus.identity.auth.session;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthSessionService authSessionService;

    public AuthController(AuthSessionService authSessionService) {
        this.authSessionService = authSessionService;
    }

    @PostMapping("/login")
    ResponseEntity<AuthSessionResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authSessionService.login(request));
    }

    @PostMapping("/mfa/verify")
    ResponseEntity<AuthSessionResponse> verifyMfa(@Valid @RequestBody MfaVerifyRequest request) {
        return ResponseEntity.ok(authSessionService.verifyMfa(request));
    }

    @PostMapping("/refresh")
    ResponseEntity<AuthSessionResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authSessionService.refresh(request));
    }

    @PostMapping("/forgot-password")
    ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authSessionService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authSessionService.resetPassword(request));
    }
}
