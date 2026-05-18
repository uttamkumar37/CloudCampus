package com.cloudcampus.auth.service;

import com.cloudcampus.auth.dto.LoginRequest;
import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * L-19: Integration test for authentication account lockout.
 *
 * Verifies that after reaching the lockout threshold of consecutive
 * bad-credential failures, the user account is actually suspended in
 * the database via the real Redis rate limiter.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestPropertySource(properties = {
    // Lower threshold to 3 for fast test execution; real logic is identical
    "app.rate-limit.login.lockout-threshold=3",
    // Raise IP/username limits so only the lockout threshold triggers first
    "app.rate-limit.login.max-attempts-per-ip=100",
    "app.rate-limit.login.max-attempts-per-username=100"
})
@DisplayName("Auth Lockout — account suspended after repeated failures (L-19)")
class AuthLockoutIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    @ServiceConnection
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired private AuthService       authService;
    @Autowired private UserRepository    userRepository;
    @Autowired private TenantRepository  tenantRepository;
    @Autowired private PasswordEncoder   passwordEncoder;

    private User   user;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        RequestContext.clearAll();
        tenant = tenantRepository.save(new Tenant(
                UUID.randomUUID(), "lockout-" + UUID.randomUUID(),
                "Lockout Test Tenant", TenantStatus.ACTIVE, Instant.now()));
        String hash = passwordEncoder.encode("correct-password");
        user = userRepository.save(new User(
                UUID.randomUUID(), tenant.getId(), "lockout@test.com",
                hash, UserRole.TEACHER, UserStatus.ACTIVE, false, Instant.now()));
    }

    @AfterEach
    void tearDown() {
        RequestContext.clearAll();
        userRepository.deleteAll();
        tenantRepository.deleteAll();
    }

    @Test
    @DisplayName("Account is SUSPENDED in the DB after 3 consecutive wrong-password attempts")
    void login_suspends_account_after_lockout_threshold_failures() {
        LoginRequest req = new LoginRequest("lockout@test.com", "wrong-password");

        // 3 failed logins — each throws UnauthorizedException; 3rd triggers lockout
        for (int i = 0; i < 3; i++) {
            try {
                authService.login(req, "10.0.0.1");
            } catch (UnauthorizedException ignored) { /* expected */ }
        }

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getStatus())
                .as("account must be SUSPENDED in DB after lockout threshold is reached")
                .isEqualTo(UserStatus.SUSPENDED);
    }
}
