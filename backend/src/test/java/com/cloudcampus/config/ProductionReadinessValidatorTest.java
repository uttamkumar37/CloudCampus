package com.cloudcampus.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class ProductionReadinessValidatorTest {

    @Test
    void skipsValidationOutsideProductionProfile() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.profiles.active", "local")
                .withProperty("cloudcampus.auth.jwt-secret", "dev-only-cloudcampus-auth-token-secret-change-me");

        assertThatCode(() -> new ProductionReadinessValidator(environment).validateIfProduction())
                .doesNotThrowAnyException();
    }

    @Test
    void acceptsSafeProductionConfiguration() {
        MockEnvironment environment = safeProductionEnvironment();

        assertThatCode(() -> new ProductionReadinessValidator(environment).validateIfProduction())
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsUnsafeProductionDefaultsWithClearMessages() {
        MockEnvironment environment = productionEnvironment()
                .withProperty("cloudcampus.auth.jwt-secret", "dev-only-cloudcampus-auth-token-secret-change-me")
                .withProperty("spring.datasource.url", "jdbc:h2:mem:cloudcampus")
                .withProperty("cloudcampus.cors.allowed-origins", "*")
                .withProperty("cloudcampus.notifications.email.app-base-url", "http://localhost:5173")
                .withProperty("cloudcampus.notifications.email.mode", "log")
                .withProperty("cloudcampus.bootstrap.super-admin.enabled", "true")
                .withProperty("cloudcampus.bootstrap.super-admin.password", "SuperAdmin123!")
                .withProperty("management.endpoints.web.exposure.include", "health,env,beans");

        assertThatThrownBy(() -> new ProductionReadinessValidator(environment).validateIfProduction())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CloudCampus production startup validation failed")
                .hasMessageContaining("CLOUDCAMPUS_AUTH_JWT_SECRET must not use a development or placeholder value")
                .hasMessageContaining("CLOUDCAMPUS_AUTH_JWT_SECRET must be at least 64 characters")
                .hasMessageContaining("CLOUDCAMPUS_JDBC_URL must point to PostgreSQL")
                .hasMessageContaining("CLOUDCAMPUS_CORS_ALLOWED_ORIGINS must not contain '*'")
                .hasMessageContaining("CLOUDCAMPUS_APP_BASE_URL must be an HTTPS URL")
                .hasMessageContaining("CLOUDCAMPUS_EMAIL_MODE=log is not allowed")
                .hasMessageContaining("CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_ENABLED must be false")
                .hasMessageContaining("CLOUDCAMPUS_BOOTSTRAP_SUPER_ADMIN_PASSWORD must be blank")
                .hasMessageContaining("unsafe actuator endpoint 'env'")
                .hasMessageContaining("unsafe actuator endpoint 'beans'");
    }

    @Test
    void requiresSmtpSettingsWhenSmtpModeIsEnabled() {
        MockEnvironment environment = safeProductionEnvironment()
                .withProperty("spring.mail.host", "")
                .withProperty("spring.mail.username", "")
                .withProperty("spring.mail.password", "");

        assertThatThrownBy(() -> new ProductionReadinessValidator(environment).validateIfProduction())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CLOUDCAMPUS_SMTP_HOST is required")
                .hasMessageContaining("CLOUDCAMPUS_SMTP_USERNAME is required")
                .hasMessageContaining("CLOUDCAMPUS_SMTP_PASSWORD is required");
    }

    @Test
    void rejectsProductionPlaceholderDomainsAndSmtpValues() {
        MockEnvironment environment = safeProductionEnvironment()
                .withProperty("cloudcampus.cors.allowed-origins", "https://app.cloudcampus.example")
                .withProperty("cloudcampus.notifications.email.app-base-url", "https://app.cloudcampus.example")
                .withProperty("spring.mail.host", "smtp.example.com")
                .withProperty("spring.mail.username", "replace-with-smtp-username")
                .withProperty("spring.mail.password", "replace-with-smtp-password");

        assertThatThrownBy(() -> new ProductionReadinessValidator(environment).validateIfProduction())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CLOUDCAMPUS_CORS_ALLOWED_ORIGINS must not contain placeholder origin")
                .hasMessageContaining("CLOUDCAMPUS_APP_BASE_URL must not use a placeholder domain")
                .hasMessageContaining("CLOUDCAMPUS_SMTP_HOST must not use a placeholder value")
                .hasMessageContaining("CLOUDCAMPUS_SMTP_USERNAME must not use a placeholder value")
                .hasMessageContaining("CLOUDCAMPUS_SMTP_PASSWORD must not use a placeholder value");
    }


    @Test
    void allowsExplicitProductionLogEmailOverrideForDryRuns() {
        MockEnvironment environment = safeProductionEnvironment()
                .withProperty("cloudcampus.notifications.email.mode", "log")
                .withProperty("cloudcampus.notifications.email.allow-log-mode-in-production", "true")
                .withProperty("spring.mail.host", "")
                .withProperty("spring.mail.username", "")
                .withProperty("spring.mail.password", "");

        assertThatCode(() -> new ProductionReadinessValidator(environment).validateIfProduction())
                .doesNotThrowAnyException();
    }

    private MockEnvironment safeProductionEnvironment() {
        return productionEnvironment()
                .withProperty("cloudcampus.auth.jwt-secret", "prod-secret-1234567890-prod-secret-1234567890-prod-secret-1234567890")
                .withProperty("spring.datasource.url", "jdbc:postgresql://postgres.internal:5432/cloudcampus")
                .withProperty("cloudcampus.cors.allowed-origins", "https://app.cloudcampus.com")
                .withProperty("cloudcampus.notifications.email.app-base-url", "https://app.cloudcampus.com")
                .withProperty("cloudcampus.notifications.email.mode", "smtp")
                .withProperty("spring.mail.host", "smtp.mailgun.org")
                .withProperty("spring.mail.username", "smtp-user")
                .withProperty("spring.mail.password", "smtp-password")
                .withProperty("cloudcampus.bootstrap.super-admin.enabled", "false")
                .withProperty("cloudcampus.bootstrap.super-admin.password", "")
                .withProperty("management.endpoints.web.exposure.include", "health,info,prometheus");
    }

    private MockEnvironment productionEnvironment() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        return environment;
    }
}
