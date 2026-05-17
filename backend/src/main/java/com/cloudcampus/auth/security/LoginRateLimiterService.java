package com.cloudcampus.auth.security;

import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.config.RateLimitProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

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
    private static final String KEY_PREFIX_LOCK = "lock:fail:";

    // H-12: atomic sliding-window Lua script — eliminates the TOCTOU race between
    // ZREMRANGEBYSCORE → ZCARD → ZADD that previously allowed bursts to slip through.
    // Returns 1 if the request is allowed, 0 if the limit is exceeded.
    private static final DefaultRedisScript<Long> SLIDING_WINDOW_SCRIPT =
            new DefaultRedisScript<>(
                    "local now = tonumber(ARGV[1])\n" +
                    "local windowStart = tonumber(ARGV[2])\n" +
                    "local maxAttempts = tonumber(ARGV[3])\n" +
                    "local windowSeconds = tonumber(ARGV[4])\n" +
                    "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, windowStart)\n" +
                    "local count = redis.call('ZCARD', KEYS[1])\n" +
                    "if count >= maxAttempts then return 0 end\n" +
                    "redis.call('ZADD', KEYS[1], now, now .. ':' .. math.random())\n" +
                    "redis.call('EXPIRE', KEYS[1], windowSeconds)\n" +
                    "return 1",
                    Long.class);

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

    // ── Credential-failure lockout ───────────────────────────────────────────

    /**
     * Increments the bad-credential counter for a username.
     *
     * Must be called ONLY when the user exists and the password was wrong — not for
     * unknown usernames (no account to suspend).
     *
     * @return true if the lockout threshold is now reached (caller should suspend the account)
     */
    public boolean recordCredentialFailure(String username) {
        String key = KEY_PREFIX_LOCK + username;
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, Duration.ofSeconds(props.lockoutWindowSeconds()));
            return count != null && count >= props.lockoutThreshold();
        } catch (Exception e) {
            log.warn("Lockout counter unavailable (Redis down?), failing open [key={}]: {}",
                    redactKey(key), e.getMessage());
            return false;
        }
    }

    /**
     * Clears the bad-credential counter after a successful login.
     * No-op if Redis is unavailable.
     */
    public void clearCredentialFailures(String username) {
        String key = KEY_PREFIX_LOCK + username;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Could not clear lockout counter (Redis down?), ignoring [key={}]: {}",
                    redactKey(key), e.getMessage());
        }
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private void checkWindow(String key, int maxAttempts, long windowSeconds) {
        long nowMs       = System.currentTimeMillis();
        long windowStart = nowMs - (windowSeconds * 1_000L);

        try {
            // H-12: single atomic Lua call — eliminates the TOCTOU race of the previous
            // 4-step ZREMRANGEBYSCORE → ZCARD → ZADD → EXPIRE sequence.
            Long allowed = redisTemplate.execute(
                    SLIDING_WINDOW_SCRIPT,
                    List.of(key),
                    String.valueOf(nowMs),
                    String.valueOf(windowStart),
                    String.valueOf(maxAttempts),
                    String.valueOf(windowSeconds));

            if (!Long.valueOf(1L).equals(allowed)) {
                log.warn("Rate limit exceeded [key={}]", redactKey(key));
                throw new TooManyRequestsException("Too many requests. Please try again later.");
            }
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            // Fail-open: BCrypt cost (≈300 ms) acts as deterrent when Redis is down.
            log.warn("Rate limiter unavailable (Redis down?), failing open [key={}]: {}",
                    redactKey(key), e.getMessage());
        }
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
