package com.cloudcampus.auth.bootstrap;

import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * C-14: Super Admin Bootstrap.
 *
 * Creates the first SUPER_ADMIN user on first boot.
 * Idempotent: if the username already exists, this is a no-op.
 * Skipped entirely if BOOTSTRAP_ADMIN_PASSWORD environment variable is empty.
 *
 * SECURITY notes:
 *   - Password is read from environment variable, never from application.yml directly.
 *   - The bootstrap password should be a strong temporary credential.
 *   - Force a password change on first login (forcePasswordChange=true).
 *   - Rotate the BOOTSTRAP_ADMIN_PASSWORD env var after first deployment.
 *   - Super Admin login should require MFA (planned in CC-0116).
 *
 * Deployment: This runs after every restart. It is idempotent and safe.
 *             It logs a clear warning if the env var is missing.
 */
@Component
public class SuperAdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminBootstrap.class);

    @Value("${app.bootstrap.admin.username:superadmin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("BOOTSTRAP: BOOTSTRAP_ADMIN_PASSWORD is not set. " +
                     "Super admin creation skipped. Set this env var on first deployment.");
            return;
        }

        if (userRepository.existsByUsername(adminUsername)) {
            log.debug("BOOTSTRAP: Super admin '{}' already exists. Skipping.", adminUsername);
            return;
        }

        Instant now = Instant.now();
        User superAdmin = new User(
                UUID.randomUUID(),
                null,                              // No tenant — platform-level account
                adminUsername,
                passwordEncoder.encode(adminPassword),
                UserRole.SUPER_ADMIN,
                UserStatus.ACTIVE,
                true,                              // Force password change on first login
                now
        );

        userRepository.save(superAdmin);

        // Log at INFO so it appears in production logs for audit trail.
        // Do NOT log the password or the hash.
        log.info("BOOTSTRAP: Super admin '{}' created successfully. " +
                 "Please change the password on first login.", adminUsername);
    }
}
