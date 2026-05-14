package com.cloudcampus.common.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Rate-limit configuration for general API endpoints (CC-1805).
 *
 * Two independent sliding windows per annotated request:
 *   Per-user   — prevents a single user from flooding expensive endpoints.
 *   Per-tenant — prevents one tenant from monopolising shared resources.
 *
 * Bound from application.yml under app.rate-limit.api.*
 */
@ConfigurationProperties(prefix = "app.rate-limit.api")
public record ApiRateLimitProperties(
        int  perUserRequests,
        long perUserWindowSeconds,
        int  perTenantRequests,
        long perTenantWindowSeconds
) {}
