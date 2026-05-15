package com.cloudcampus.config;

import com.cloudcampus.common.crypto.EncryptionProperties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * Startup guard that refuses to boot in non-dev/non-test profiles when
 * any secret matches a known dev default or fails a minimum-length check.
 *
 * This prevents a class of incidents where a staging or production
 * deployment inherits dev defaults because an env var was never set.
 *
 * Unsafe defaults are detected by exact-match against the hard-coded
 * fallbacks defined in application.yml. The guard skips silently in the
 * "dev" and "test" profiles where those defaults are intentional.
 *
 * References: CC-1906 — Secrets Management Standard.
 */
@Configuration
public class SecretsGuardConfig {

    private static final Logger log = LoggerFactory.getLogger(SecretsGuardConfig.class);

    private static final int MIN_SECRET_LENGTH = 32;

    private static final Set<String> UNSAFE_JWT_SECRETS = Set.of(
            "changeme-dev-secret-minimum-32-chars!!"
    );

    private static final Set<String> UNSAFE_ENCRYPTION_SECRETS = Set.of(
            "dev-encryption-key-must-be-at-least-32ch",
            "dev-aes-key-for-local-only-do-not-use-in-production-32+",
            "test-encryption-secret-for-integration-tests-only-do-not-use-in-production"
    );

    private static final Set<String> UNSAFE_BOOTSTRAP_PASSWORDS = Set.of(
            "admin123", "password", "changeme", "secret"
    );

    private final Environment environment;
    private final JwtProperties jwtProperties;
    private final EncryptionProperties encryptionProperties;

    SecretsGuardConfig(Environment environment,
                       JwtProperties jwtProperties,
                       EncryptionProperties encryptionProperties) {
        this.environment = environment;
        this.jwtProperties = jwtProperties;
        this.encryptionProperties = encryptionProperties;
    }

    @PostConstruct
    void validate() {
        List<String> activeProfiles = Arrays.asList(environment.getActiveProfiles());
        if (activeProfiles.contains("dev") || activeProfiles.contains("test")) {
            log.debug("SecretsGuard: skipping validation in profile(s): {}", activeProfiles);
            return;
        }

        log.info("SecretsGuard: validating secrets for profile(s): {}", activeProfiles);

        List<String> violations = new ArrayList<>();

        // ── JWT secret ────────────────────────────────────────────────────────
        String jwtSecret = jwtProperties.secret();
        if (UNSAFE_JWT_SECRETS.contains(jwtSecret)) {
            violations.add("JWT_SECRET is the dev default — set a random value: openssl rand -hex 32");
        } else if (jwtSecret == null || jwtSecret.length() < MIN_SECRET_LENGTH) {
            violations.add("JWT_SECRET is too short — minimum " + MIN_SECRET_LENGTH + " characters required");
        }

        // ── Encryption secret ─────────────────────────────────────────────────
        String encSecret = encryptionProperties.secret();
        if (UNSAFE_ENCRYPTION_SECRETS.contains(encSecret)) {
            violations.add("ENCRYPTION_SECRET is the dev default — set a random value: openssl rand -hex 32");
        } else if (encSecret == null || encSecret.length() < MIN_SECRET_LENGTH) {
            violations.add("ENCRYPTION_SECRET is too short — minimum " + MIN_SECRET_LENGTH + " characters required");
        }

        // ── Bootstrap admin password ───────────────────────────────────────────
        String bootstrapPassword = environment.getProperty("app.bootstrap.admin.password", "");
        if (!bootstrapPassword.isBlank() && UNSAFE_BOOTSTRAP_PASSWORDS.contains(bootstrapPassword.toLowerCase())) {
            violations.add("app.bootstrap.admin.password (BOOTSTRAP_ADMIN_PASSWORD) is a well-known weak value — use a strong password or leave blank to skip bootstrap");
        }

        // ── Database password ─────────────────────────────────────────────────
        String dbPassword = environment.getProperty("spring.datasource.password", "");
        if (dbPassword.isBlank()) {
            violations.add("spring.datasource.password (SPRING_DATASOURCE_PASSWORD) is blank — set via env var");
        }

        if (!violations.isEmpty()) {
            String msg = "\n\n" +
                    "╔══════════════════════════════════════════════════════════════╗\n" +
                    "║  SECRETS VALIDATION FAILED — refusing to start               ║\n" +
                    "║  One or more secrets are unsafe for a production deployment.  ║\n" +
                    "╠══════════════════════════════════════════════════════════════╣\n" +
                    violations.stream()
                            .map(v -> "║  • " + padRight(v, 58) + "║\n")
                            .reduce("", String::concat) +
                    "╠══════════════════════════════════════════════════════════════╣\n" +
                    "║  See .env.example for required environment variables.         ║\n" +
                    "╚══════════════════════════════════════════════════════════════╝\n";
            throw new IllegalStateException(msg);
        }

        log.info("SecretsGuard: all secrets validated — OK");
    }

    private static String padRight(String s, int width) {
        if (s.length() >= width) return s.substring(0, width);
        return s + " ".repeat(width - s.length());
    }
}
