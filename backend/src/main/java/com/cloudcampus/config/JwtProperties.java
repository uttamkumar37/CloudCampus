package com.cloudcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT configuration bound from application.yml under app.jwt.
 *
 * secret: must be at least 32 characters (256-bit minimum for HS256).
 *         In production, inject via JWT_SECRET environment variable —
 *         never hardcode or commit to version control.
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long accessTokenExpirySeconds,
        long refreshTokenExpirySeconds
) {
}
