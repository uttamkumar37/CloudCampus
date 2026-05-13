package com.cloudcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OTP configuration bound from application.yml under app.otp.
 *
 * fromEmail: the "From" address on password-reset emails.
 *            In production, inject via MAIL_FROM environment variable.
 */
@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
        int ttlSeconds,
        int length,
        String fromEmail
) {
}
