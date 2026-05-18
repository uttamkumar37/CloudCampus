package com.cloudcampus.auth.security;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/**
 * Redis-backed JWT access token denylist (H-02).
 *
 * Without revocation, a valid access token remains usable for up to 15 minutes
 * after logout. Storing the jti (JWT ID) in Redis with a TTL equal to the
 * token's remaining lifetime ensures that logged-out tokens are rejected within
 * the same request cycle rather than after they naturally expire.
 *
 * Key: jti:{jti}  →  "1"  (TTL = remaining token lifetime)
 *
 * Memory impact is minimal: each entry is ~50 bytes + Redis overhead.
 * Entries expire automatically — no cleanup job needed.
 */
@Component
public class JwtDenylistService {

    private static final String KEY_PREFIX = "jti:";
    private static final long   MIN_TTL_SECONDS = 1L;

    private final RedisTemplate<String, String> redisTemplate;

    public JwtDenylistService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Add a jti to the denylist. TTL is capped to the token's remaining valid duration
     * so the entry is automatically evicted once the token would have expired anyway.
     */
    public void deny(String jti, Instant tokenExpiry) {
        if (jti == null || jti.isBlank()) return;
        long ttlSeconds = tokenExpiry.getEpochSecond() - Instant.now().getEpochSecond();
        if (ttlSeconds <= 0) return;
        redisTemplate.opsForValue()
                .set(KEY_PREFIX + jti, "1", Duration.ofSeconds(Math.max(ttlSeconds, MIN_TTL_SECONDS)));
    }

    /** Returns true if the jti has been explicitly revoked. */
    public boolean isDenied(String jti) {
        if (jti == null || jti.isBlank()) return false;
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jti));
    }
}
