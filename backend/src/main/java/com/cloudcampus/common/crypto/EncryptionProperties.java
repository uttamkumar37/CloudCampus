package com.cloudcampus.common.crypto;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * AES-256 encryption key loaded from the environment.
 *
 * Bound from {@code app.encryption.secret}.
 * Minimum 32 characters required; the actual AES key is derived by SHA-256
 * hashing the secret so any length works (SHA-256 always yields 256 bits).
 *
 * Production: set ENCRYPTION_SECRET env var from HashiCorp Vault or AWS Secrets Manager.
 * SECURITY: Never commit the real secret to source control.
 */
@ConfigurationProperties(prefix = "app.encryption")
public record EncryptionProperties(String secret) {}
