package com.cloudcampus.auth.service;

import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.dto.LoginResponse;
import com.cloudcampus.auth.dto.RefreshRequest;
import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.auth.security.JwtDenylistService;
import com.cloudcampus.auth.security.JwtUtil;
import com.cloudcampus.auth.security.LoginRateLimiterService;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.config.JwtProperties;
import com.cloudcampus.feature.repository.TenantFeatureRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.service.UserSchoolAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepository             userRepository;
    @Mock PasswordEncoder            passwordEncoder;
    @Mock JwtUtil                    jwtUtil;
    @Mock JwtProperties              jwtProperties;
    @Mock RedisTemplate<String, String> redisTemplate;
    @Mock LoginRateLimiterService    rateLimiter;
    @Mock AuditLogService            auditLog;
    @Mock SchoolRepository           schoolRepository;
    @Mock UserSchoolAccessService    userSchoolAccessService;
    @Mock TenantFeatureRepository    tenantFeatureRepository;
    @Mock JwtDenylistService         jwtDenylistService;
    @Mock com.cloudcampus.common.metrics.BusinessMetrics metrics;
    @Mock ValueOperations<String, String> valueOps;
    @Mock SetOperations<String, String>   setOps;

    static final UUID TENANT_ID = UUID.randomUUID();
    static final UUID USER_ID   = UUID.randomUUID();

    AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository, passwordEncoder, jwtUtil, jwtProperties,
                redisTemplate, rateLimiter, auditLog, schoolRepository,
                userSchoolAccessService, tenantFeatureRepository, jwtDenylistService,
                metrics);
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returnsAccessToken() {
        User user = activeUser();
        when(userRepository.findByUsername("teacher@school.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtUtil.generateAccessToken(any(), any(), any(), any())).thenReturn("access-token");
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(redisTemplate.opsForSet()).thenReturn(setOps);
        when(jwtProperties.refreshTokenExpirySeconds()).thenReturn(604800L);
        when(jwtProperties.accessTokenExpirySeconds()).thenReturn(900L);
        when(tenantFeatureRepository.findEnabledKeysByTenantId(TENANT_ID)).thenReturn(List.of());

        LoginResponse response = authService.login(
                new LoginRequest("teacher@school.com", "secret"), "1.2.3.4");

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.userId()).isEqualTo(USER_ID);
        assertThat(response.role()).isEqualTo("TEACHER");
    }

    @Test
    void login_withWrongPassword_throwsUnauthorized() {
        User user = activeUser();
        when(userRepository.findByUsername("teacher@school.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("teacher@school.com", "wrong"), "1.2.3.4"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_withUnknownUser_throwsSameExceptionAsWrongPassword() {
        // OWASP user enumeration prevention — unknown email must produce identical error
        when(userRepository.findByUsername("ghost@school.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("ghost@school.com", "any"), "1.2.3.4"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_suspendsAccount_whenLockoutThresholdReached() {
        User user = activeUser();
        when(userRepository.findByUsername("teacher@school.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);
        when(rateLimiter.recordCredentialFailure("teacher@school.com")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("teacher@school.com", "wrong"), "1.2.3.4"))
                .isInstanceOf(UnauthorizedException.class);

        assertThat(user.getStatus()).isEqualTo(UserStatus.SUSPENDED);
        verify(userRepository).save(user);
    }

    @Test
    void login_withSuspendedAccount_throwsForbidden() {
        User user = new User(USER_ID, TENANT_ID, "teacher@school.com", "hash",
                UserRole.TEACHER, UserStatus.SUSPENDED, false, Instant.now());
        when(userRepository.findByUsername("teacher@school.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("teacher@school.com", "secret"), "1.2.3.4"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_withExpiredOrConsumedToken_throwsUnauthorized() {
        // Lua GET+DEL script returns null → token expired or already consumed
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList())).thenReturn(null);

        assertThatThrownBy(() -> authService.refresh(new RefreshRequest("stale-token")))
                .isInstanceOf(UnauthorizedException.class);
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Test
    void logout_denylists_accessToken_fromRequestContext() {
        // Validates H-02: even when the refresh token is already expired,
        // the access token jti must be added to the Redis denylist.
        String jti    = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusSeconds(300);

        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        // valueOps.get() returns null → refresh token already gone, audit block skipped.
        // delete() returns null (Mockito default for Boolean) → Boolean.TRUE.equals(null) == false.

        try (MockedStatic<RequestContext> ctx = mockStatic(RequestContext.class)) {
            ctx.when(RequestContext::getJwtJti).thenReturn(jti);
            ctx.when(RequestContext::getJwtExpiry).thenReturn(expiry);

            authService.logout(new RefreshRequest("any-refresh-token"));
        }

        verify(jwtDenylistService).deny(jti, expiry);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User activeUser() {
        return new User(USER_ID, TENANT_ID, "teacher@school.com", "hash",
                UserRole.TEACHER, UserStatus.ACTIVE, false, Instant.now());
    }
}
