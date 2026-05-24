package com.cloudcampus.config;

import com.cloudcampus.common.crypto.EncryptionProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SecretsGuardConfigTest {

    @Test
    void prodProfile_requiresBootstrapAdminPassword() {
        MockEnvironment env = baseProdEnvironment()
                .withProperty("app.bootstrap.admin.password", "");

        SecretsGuardConfig guard = new SecretsGuardConfig(
                env,
                new JwtProperties("jwt-secret-that-is-long-enough-for-prod-123", 900, 2592000),
                new EncryptionProperties("encryption-secret-that-is-long-enough-123"));

        assertThatThrownBy(guard::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BOOTSTRAP_ADMIN_PASSWORD is required in the prod profile");
    }

    @Test
    void prodProfile_acceptsStrongBootstrapAdminPassword() {
        MockEnvironment env = baseProdEnvironment()
                .withProperty("app.bootstrap.admin.password", "bootstrap-secret-that-is-long-enough-123");

        SecretsGuardConfig guard = new SecretsGuardConfig(
                env,
                new JwtProperties("jwt-secret-that-is-long-enough-for-prod-123", 900, 2592000),
                new EncryptionProperties("encryption-secret-that-is-long-enough-123"));

        assertThatCode(guard::validate).doesNotThrowAnyException();
    }

    private static MockEnvironment baseProdEnvironment() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.withProperty("spring.datasource.password", "database-secret-that-is-long-enough-123")
                .withProperty("spring.data.redis.host", "redis")
                .withProperty("app.minio.endpoint", "https://minio.example.com")
                .withProperty("app.minio.access-key", "minio-access")
                .withProperty("app.minio.secret-key", "minio-secret-that-is-long-enough-123")
                .withProperty("spring.rabbitmq.host", "rabbitmq")
                .withProperty("spring.rabbitmq.username", "cc-prod")
                .withProperty("spring.rabbitmq.password", "rabbit-secret-that-is-long-enough-123")
                .withProperty("app.razorpay.enabled", "false")
                .withProperty("app.ai.enabled", "false");
        return env;
    }
}
