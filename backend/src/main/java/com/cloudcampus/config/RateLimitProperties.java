package com.cloudcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Rate-limit configuration for the login endpoint.
 *
 * Two independent sliding windows are maintained in Redis:
 *
 *   Per-IP window   — limits brute-force attacks from a single IP (credential stuffing).
 *   Per-username window — limits targeted attacks against a known username.
 *
 * Both limits must be satisfied for a login attempt to proceed. Either window
 * exceeding its limit results in HTTP 429.
 *
 * Bound from application.yml under app.rate-limit.login.*
 * Defaults: 20 attempts / 5 minutes per IP; 10 attempts / 15 minutes per username.
 */
@ConfigurationProperties(prefix = "app.rate-limit.login")
public record RateLimitProperties(
        int  maxAttemptsPerIp,
        long windowSecondsPerIp,
        int  maxAttemptsPerUsername,
        long windowSecondsPerUsername
) {}
