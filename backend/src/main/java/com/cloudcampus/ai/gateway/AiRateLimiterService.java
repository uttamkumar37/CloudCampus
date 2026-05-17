package com.cloudcampus.ai.gateway;

import com.cloudcampus.common.exception.TooManyRequestsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * H-24: Per-user sliding-window rate limiter for AI endpoints.
 *
 * Key: rl:ai:user:{userId}  →  sorted-set of request timestamps
 *
 * Uses the same atomic Lua sliding-window algorithm as LoginRateLimiterService
 * to avoid the TOCTOU race in a multi-instance deployment.
 * Fails-open if Redis is unavailable — the budget enforcer (AiBudgetEnforcer)
 * acts as a second line of defence in that case.
 */
@Service
public class AiRateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(AiRateLimiterService.class);

    private static final String KEY_PREFIX = "rl:ai:user:";

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

    @Value("${app.ai.rate-limit.max-per-user-per-minute:20}")
    private int maxPerUserPerMinute;

    private static final long WINDOW_SECONDS = 60L;

    public AiRateLimiterService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Enforce per-user AI call rate limit. Call this before invoking the LLM.
     *
     * @param userId the authenticated user's ID (null is treated as a no-op to
     *               avoid blocking system-initiated calls that have no user context)
     * @throws TooManyRequestsException if the per-user per-minute limit is exceeded
     */
    public void check(UUID userId) {
        if (userId == null) return;
        String key = KEY_PREFIX + userId;
        long nowMs       = System.currentTimeMillis();
        long windowStart = nowMs - (WINDOW_SECONDS * 1_000L);

        try {
            Long allowed = redisTemplate.execute(
                    SLIDING_WINDOW_SCRIPT,
                    List.of(key),
                    String.valueOf(nowMs),
                    String.valueOf(windowStart),
                    String.valueOf(maxPerUserPerMinute),
                    String.valueOf(WINDOW_SECONDS));

            if (!Long.valueOf(1L).equals(allowed)) {
                log.warn("AI rate limit exceeded [userId={}]", userId);
                throw new TooManyRequestsException("AI request rate limit exceeded. Please try again later.");
            }
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            log.warn("AI rate limiter unavailable (Redis down?), failing open [userId={}]: {}",
                    userId, e.getMessage());
        }
    }
}
