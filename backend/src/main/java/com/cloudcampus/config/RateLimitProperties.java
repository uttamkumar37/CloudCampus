package com.cloudcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Rate-limit configuration for the login endpoint.
 *
 * Two independent sliding windows are maintained in Redis:
 *
 *   Per-IP window       — limits brute-force attacks from a single IP.
 *   Per-username window — limits targeted attacks against a known username.
 *
 * Additionally, an account-lockout counter tracks consecutive bad-credential
 * failures per username. Once lockoutThreshold is reached the account is
 * set to SUSPENDED in the database and must be re-activated by an admin.
 *
 * Bound from application.yml under app.rate-limit.login.*
 */
@ConfigurationProperties(prefix = "app.rate-limit.login")
public record RateLimitProperties(
        int  maxAttemptsPerIp,
        long windowSecondsPerIp,
        int  maxAttemptsPerUsername,
        long windowSecondsPerUsername,
        int  lockoutThreshold,        // bad-credential failures before account suspension
        long lockoutWindowSeconds     // counter TTL; resets after this many seconds of inactivity
) {}
