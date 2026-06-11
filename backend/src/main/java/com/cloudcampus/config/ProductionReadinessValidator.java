package com.cloudcampus.config;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.core.env.Environment;

public class ProductionReadinessValidator {

    private static final String DEV_JWT_SECRET = "dev-only-cloudcampus-auth-token-secret-change-me";
    private static final Set<String> UNSAFE_ACTUATOR_ENDPOINTS = Set.of(
            "*",
            "beans",
            "caches",
            "conditions",
            "configprops",
            "env",
            "heapdump",
            "logfile",
            "loggers",
            "mappings",
            "scheduledtasks",
            "sessions",
            "shutdown",
            "threaddump"
    );

    private final Environment environment;

    public ProductionReadinessValidator(Environment environment) {
        this.environment = environment;
    }

    void validateIfProduction() {
        if (!isProductionProfileActive()) {
            return;
        }

        List<String> failures = new ArrayList<>();
        validateJwtSecret(failures);
        validateDatabase(failures);
        validateCors(failures);
        validatePublicUrl(failures);
        validateMail(failures);
        validateBootstrap(failures);
        validateActuatorExposure(failures);
        validateMfaCodeExposure(failures);

        if (!failures.isEmpty()) {
            throw new IllegalStateException(
                    "CloudCampus production startup validation failed:\n- " + String.join("\n- ", failures)
            );
        }
    }

    private boolean isProductionProfileActive() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(profile -> "prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile));
    }

    private void validateJwtSecret(List<String> failures) {
        String secret = property("cloudcampus.auth.jwt-secret");
        if (isBlank(secret)) {
            failures.add("CLOUDCAMPUS_AUTH_JWT_SECRET is required in production.");
            return;
        }
        if (DEV_JWT_SECRET.equals(secret) || containsUnsafeToken(secret)) {
            failures.add("CLOUDCAMPUS_AUTH_JWT_SECRET must not use a development or placeholder value.");
        }
        if (secret.length() < 64) {
            failures.add("CLOUDCAMPUS_AUTH_JWT_SECRET must be at least 64 characters.");
        }
    }

    private void validateMfaCodeExposure(List<String> failures) {
        if (environment.getProperty("cloudcampus.auth.expose-mfa-code", Boolean.class, false)) {
            failures.add("CLOUDCAMPUS_AUTH_EXPOSE_MFA_CODE must be false in production.");
        }
    }

    private void validateDatabase(List<String> failures) {
        String jdbcUrl = property("spring.datasource.url");
        if (isBlank(jdbcUrl)) {
            failures.add("CLOUDCAMPUS_JDBC_URL is required in production.");
            return;
        }
        String normalized = jdbcUrl.toLowerCase(Locale.ROOT);
        if (!normalized.startsWith("jdbc:postgresql://")) {
            failures.add("CLOUDCAMPUS_JDBC_URL must point to PostgreSQL in production.");
        }
        if (normalized.contains(":h2:") || normalized.contains("localhost") || normalized.contains("127.0.0.1")
                || normalized.contains("mem:") || normalized.contains("cloudcampus_local")) {
            failures.add("CLOUDCAMPUS_JDBC_URL must not point to H2, localhost, or local demo storage in production.");
        }
    }

    private void validateCors(List<String> failures) {
        String origins = property("cloudcampus.cors.allowed-origins");
        if (isBlank(origins)) {
            failures.add("CLOUDCAMPUS_CORS_ALLOWED_ORIGINS must be explicitly configured in production.");
            return;
        }
        for (String origin : splitCommaList(origins)) {
            if ("*".equals(origin)) {
                failures.add("CLOUDCAMPUS_CORS_ALLOWED_ORIGINS must not contain '*'.");
            } else if (!isHttpsUrl(origin)) {
                failures.add("CLOUDCAMPUS_CORS_ALLOWED_ORIGINS contains an unsafe origin: " + origin + ".");
            } else if (containsUnsafeToken(origin)) {
                failures.add("CLOUDCAMPUS_CORS_ALLOWED_ORIGINS must not contain placeholder origin: " + origin + ".");
            }
        }
    }

    private void validatePublicUrl(List<String> failures) {
        String appBaseUrl = property("cloudcampus.notifications.email.app-base-url");
        if (isBlank(appBaseUrl)) {
            failures.add("CLOUDCAMPUS_APP_BASE_URL is required in production.");
        } else if (!isHttpsUrl(appBaseUrl)) {
            failures.add("CLOUDCAMPUS_APP_BASE_URL must be an HTTPS URL in production.");
        } else if (containsUnsafeToken(appBaseUrl)) {
            failures.add("CLOUDCAMPUS_APP_BASE_URL must not use a placeholder domain.");
        }
    }

    private void validateMail(List<String> failures) {
        String mode = property("cloudcampus.notifications.email.mode");
        if (isBlank(mode)) {
            failures.add("CLOUDCAMPUS_EMAIL_MODE is required in production.");
            return;
        }

        boolean allowLogMode = environment.getProperty(
                "cloudcampus.notifications.email.allow-log-mode-in-production",
                Boolean.class,
                false
        );
        if ("log".equalsIgnoreCase(mode) && !allowLogMode) {
            failures.add("CLOUDCAMPUS_EMAIL_MODE=log is not allowed in production unless CLOUDCAMPUS_ALLOW_LOG_EMAIL_IN_PRODUCTION=true.");
        }
        if ("smtp".equalsIgnoreCase(mode)) {
            require("spring.mail.host", "CLOUDCAMPUS_SMTP_HOST", failures);
            require("spring.mail.username", "CLOUDCAMPUS_SMTP_USERNAME", failures);
            require("spring.mail.password", "CLOUDCAMPUS_SMTP_PASSWORD", failures);
            rejectPlaceholder("spring.mail.host", "CLOUDCAMPUS_SMTP_HOST", failures);
            rejectPlaceholder("spring.mail.username", "CLOUDCAMPUS_SMTP_USERNAME", failures);
            rejectPlaceholder("spring.mail.password", "CLOUDCAMPUS_SMTP_PASSWORD", failures);
        }
    }

    private void validateBootstrap(List<String> failures) {
        boolean superAdminBootstrap = environment.getProperty(
                "cloudcampus.bootstrap.super-admin.enabled",
                Boolean.class,
                false
        );
        if (superAdminBootstrap) {
            failures.add("CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED must be false in production.");
        }
        if (!isBlank(property("cloudcampus.bootstrap.super-admin.password"))) {
            failures.add("CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD must be blank in production.");
        }
    }

    private void validateActuatorExposure(List<String> failures) {
        String exposure = environment.getProperty("management.endpoints.web.exposure.include", "health,info,prometheus");
        for (String endpoint : splitCommaList(exposure)) {
            String normalized = endpoint.toLowerCase(Locale.ROOT);
            if (UNSAFE_ACTUATOR_ENDPOINTS.contains(normalized)) {
                failures.add("management.endpoints.web.exposure.include exposes unsafe actuator endpoint '" + endpoint + "' in production.");
            }
        }
    }

    private void require(String propertyName, String envName, List<String> failures) {
        if (isBlank(property(propertyName))) {
            failures.add(envName + " is required when CLOUDCAMPUS_EMAIL_MODE=smtp in production.");
        }
    }

    private void rejectPlaceholder(String propertyName, String envName, List<String> failures) {
        String value = property(propertyName);
        if (!isBlank(value) && containsUnsafeToken(value)) {
            failures.add(envName + " must not use a placeholder value in production.");
        }
    }

    private String property(String name) {
        return environment.getProperty(name, "");
    }

    private List<String> splitCommaList(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }

    private boolean isHttpsUrl(String value) {
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme()) && !isBlank(uri.getHost());
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean containsUnsafeToken(String value) {
        String normalized = value.toLowerCase(Locale.ROOT);
        return normalized.contains("replace-with")
                || normalized.contains("change-me")
                || normalized.contains("dev-only")
                || normalized.contains("local-only")
                || normalized.contains("example");
    }
}
