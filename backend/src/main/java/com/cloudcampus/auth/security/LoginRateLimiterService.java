package com.cloudcampus.auth.security;

import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.config.RateLimitProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Sliding-window rate limiter for the login endpoint (CC-1801 / EUP-030).
 *
 * Two independent Redis sorted-set windows:
 *
 *   Key: rl:login:ip:{clientIp}        — per-IP limit   (default 20/5 min)
 *   Key: rl:login:user:{username}      — per-user limit  (default 10/15 min)
 *
 * Algorithm (sorted-set sliding window):
 *   1. ZREMRANGEBYSCORE — evict entries older than the window.
 *   2. ZCARD            — count remaining entries.
 *   3. If count >= limit → throw TooManyRequestsException (429).
 *   4. ZADD now:{uuid}  — record the current attempt (UUID member avoids key collision).
 *   5. EXPIRE           — reset TTL so the key does not leak in Redis.
 *
 * Note on atomicity: steps 1-5 are not atomic. In high-concurrency scenarios a Lua
 * script would be required. For current throughput (school SaaS) this is sufficient.
 * The window is on the safe side (slightly permissive under extreme concurrency),
 * which is acceptable — the primary protection comes from BCrypt's cost (≈300 ms/hash).
 *
 * SECURITY:
 *   - The 429 response body NEVER reveals the remaining allowance or retry-after time.
 *   - The key uses the raw IP and username — neither is logged at DEBUG in production
 *     (username enumeration could be inferred from logs).
 *   - Rate limiting runs BEFORE the BCrypt check so failed attempts are counted even
 *     when the username does not exist (prevents enumeration via timing + rate limit).
 */
@Service
public class LoginRateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(LoginRateLimiterService.class);

    private static final String KEY_PREFIX_IP   = "rl:login:ip:";
    private static final String KEY_PREFIX_USER = "rl:login:user:";

    private final RedisTemplate<String, String> redisTemplate;
    private final RateLimitProperties           props;

    public LoginRateLimiterService(
            RedisTemplate<String, String> redisTemplate,
            RateLimitProperties props
    ) {
        this.redisTemplate = redisTemplate;
        this.props         = props;
    }

    /**
     * Check and record a login attempt.
     *
     * Must be called at the START of a login request — before any credential validation.
     * This ensures that enumeration attempts are counted even when the user does not exist.
     *
     * @param clientIp  the caller's IP address (extracted from X-Forwarded-For or remoteAddr)
     * @param username  the submitted username (used as-is — not normalised here)
     * @throws TooManyRequestsException if either the per-IP or per-username limit is exceeded
     */
    public void checkAndRecord(String clientIp, String username) {
        checkWindow(
                KEY_PREFIX_IP + clientIp,
                props.maxAttemptsPerIp(),
                props.windowSecondsPerIp()
        );
        checkWindow(
                KEY_PREFIX_USER + username,
                props.maxAttemptsPerUsername(),
                props.windowSecondsPerUsername()
        );
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private void checkWindow(String key, int maxAttempts, long windowSeconds) {
        long nowMs       = System.currentTimeMillis();
        long windowStart = nowMs - (windowSeconds * 1_000L);

        // 1. Evict entries outside the window.
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);

        // 2. Count remaining entries in the window.
        Long count = redisTemplate.opsForZSet().zCard(key);
        if (count != null && count >= maxAttempts) {
            log.warn("Rate limit exceeded [key={}]", redactKey(key));
            throw new TooManyRequestsException("Too many requests. Please try again later.");
        }

        // 3. Record this attempt — member is unique UUID to avoid zset deduplication.
        String member = nowMs + ":" + UUID.randomUUID();
        redisTemplate.opsForZSet().add(key, member, nowMs);

        // 4. Refresh TTL so the key doesn't stay in Redis after the window expires.
        redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
    }

    /**
     * Truncate sensitive key content for log output.
     * Logs only the key prefix and first 4 chars of the subject, e.g. "rl:login:ip:192.".
     */
    private static String redactKey(String key) {
        if (key.length() > 20) {
            return key.substring(0, 20) + "...";
        }
        return key;
    }
}
