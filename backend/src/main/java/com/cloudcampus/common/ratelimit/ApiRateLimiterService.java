package com.cloudcampus.common.ratelimit;

import com.cloudcampus.common.exception.TooManyRequestsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Sliding-window rate limiter for authenticated API endpoints (CC-1805).
 *
 * Redis key schema:
 *   rl:api:user:{userId}      — per-user window
 *   rl:api:tenant:{tenantId}  — per-tenant window
 *
 * Uses the same sorted-set sliding-window algorithm as {@code LoginRateLimiterService}.
 * Fails open when Redis is unavailable — the request is allowed through.
 */
@Service
public class ApiRateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(ApiRateLimiterService.class);

    private static final String KEY_USER   = "rl:api:user:";
    private static final String KEY_TENANT = "rl:api:tenant:";

    private final RedisTemplate<String, String> redisTemplate;
    private final ApiRateLimitProperties        props;

    public ApiRateLimiterService(RedisTemplate<String, String> redisTemplate,
                                 ApiRateLimitProperties props) {
        this.redisTemplate = redisTemplate;
        this.props = props;
    }

    /**
     * Check and record an API call for the given user and tenant.
     *
     * @throws TooManyRequestsException if either the per-user or per-tenant limit is exceeded
     */
    public void checkAndRecord(String userId, String tenantId) {
        checkWindow(KEY_USER   + userId,   props.perUserRequests(),   props.perUserWindowSeconds());
        checkWindow(KEY_TENANT + tenantId, props.perTenantRequests(), props.perTenantWindowSeconds());
    }

    private void checkWindow(String key, int maxRequests, long windowSeconds) {
        long nowMs       = System.currentTimeMillis();
        long windowStart = nowMs - (windowSeconds * 1_000L);

        try {
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);

            Long count = redisTemplate.opsForZSet().zCard(key);
            if (count != null && count >= maxRequests) {
                log.warn("API rate limit exceeded [key={}]", redact(key));
                throw new TooManyRequestsException("Rate limit exceeded. Please slow down.");
            }

            redisTemplate.opsForZSet().add(key, nowMs + ":" + UUID.randomUUID(), nowMs);
            redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            log.warn("API rate limiter unavailable (Redis down?), failing open [key={}]: {}",
                    redact(key), e.getMessage());
        }
    }

    private static String redact(String key) {
        return key.length() > 24 ? key.substring(0, 24) + "..." : key;
    }
}
