package com.cloudcampus.common.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

/**
 * JPA AttributeConverter that transparently encrypts/decrypts String columns
 * at rest using AES-256-GCM (CC-1803).
 *
 * Wire-format (database column):
 *   "ENC:" + Base64( 12-byte-IV || GCM-ciphertext-with-tag )
 *
 * Backward-compatibility: columns that do NOT start with "ENC:" are returned
 * as plain text so existing rows continue to work. They are re-encrypted on
 * the next JPA update (lazy migration).
 *
 * Spring initialisation: {@link EncryptionConfig} calls {@code initialize()}
 * in a {@code @PostConstruct} before any entity is loaded, so the static key
 * is always set before the converter is used by Hibernate.
 */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static final String PREFIX        = "ENC:";
    private static final String ALGORITHM     = "AES/GCM/NoPadding";
    private static final int    IV_LENGTH     = 12;  // 96-bit nonce recommended for GCM
    private static final int    TAG_BITS      = 128; // GCM authentication tag length

    private static volatile SecretKey KEY;

    // Called once by EncryptionConfig @PostConstruct before the app serves requests.
    public static void initialize(String secret) {
        try {
            byte[] keyBytes = MessageDigest.getInstance("SHA-256")
                    .digest(secret.getBytes(StandardCharsets.UTF_8));
            KEY = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialise PII encryption key", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String plaintext) {
        if (plaintext == null) return null;
        assertKeyInitialised();
        try {
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, KEY, new GCMParameterSpec(TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            byte[] payload = new byte[IV_LENGTH + ciphertext.length];
            System.arraycopy(iv,         0, payload, 0,         IV_LENGTH);
            System.arraycopy(ciphertext, 0, payload, IV_LENGTH, ciphertext.length);

            return PREFIX + Base64.getEncoder().encodeToString(payload);
        } catch (Exception e) {
            throw new IllegalStateException("PII encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String column) {
        if (column == null) return null;
        // Legacy plaintext rows — return as-is; will be encrypted on next save.
        if (!column.startsWith(PREFIX)) return column;
        assertKeyInitialised();
        try {
            byte[] payload    = Base64.getDecoder().decode(column.substring(PREFIX.length()));
            byte[] iv         = Arrays.copyOfRange(payload, 0, IV_LENGTH);
            byte[] ciphertext = Arrays.copyOfRange(payload, IV_LENGTH, payload.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, KEY, new GCMParameterSpec(TAG_BITS, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("PII decryption failed", e);
        }
    }

    private static void assertKeyInitialised() {
        if (KEY == null) {
            throw new IllegalStateException(
                    "EncryptedStringConverter used before EncryptionConfig.init() ran — " +
                    "check Spring bean initialisation order");
        }
    }
}
