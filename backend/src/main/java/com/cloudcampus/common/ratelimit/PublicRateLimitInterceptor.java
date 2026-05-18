package com.cloudcampus.common.ratelimit;

import com.cloudcampus.common.exception.TooManyRequestsException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

/**
 * IP-based rate limiting for unauthenticated public surfaces.
 *
 * This protects public demo, investor-room, website, and DSEP analytics routes
 * where authenticated user/tenant buckets are unavailable.
 */
@Component
public class PublicRateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(PublicRateLimitInterceptor.class);

    private static final DefaultRedisScript<Long> SLIDING_WINDOW_SCRIPT =
            new DefaultRedisScript<>(
                    "local now = tonumber(ARGV[1])\n" +
                    "local windowStart = tonumber(ARGV[2])\n" +
                    "local maxRequests = tonumber(ARGV[3])\n" +
                    "local windowSeconds = tonumber(ARGV[4])\n" +
                    "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, windowStart)\n" +
                    "local count = redis.call('ZCARD', KEYS[1])\n" +
                    "if count >= maxRequests then return 0 end\n" +
                    "redis.call('ZADD', KEYS[1], now, now .. ':' .. math.random())\n" +
                    "redis.call('EXPIRE', KEYS[1], windowSeconds)\n" +
                    "return 1",
                    Long.class);

    private final RedisTemplate<String, String> redisTemplate;
    private final int maxRequests;
    private final long windowSeconds;

    public PublicRateLimitInterceptor(
            RedisTemplate<String, String> redisTemplate,
            @Value("${app.rate-limit.public.max-requests:120}") int maxRequests,
            @Value("${app.rate-limit.public.window-seconds:60}") long windowSeconds) {
        this.redisTemplate = redisTemplate;
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        String key = "rl:public:" + request.getRemoteAddr() + ":" + bucketFor(request.getRequestURI());
        long nowMs = System.currentTimeMillis();
        long windowStart = nowMs - (windowSeconds * 1_000L);

        try {
            Long allowed = redisTemplate.execute(
                    SLIDING_WINDOW_SCRIPT,
                    List.of(key),
                    String.valueOf(nowMs),
                    String.valueOf(windowStart),
                    String.valueOf(maxRequests),
                    String.valueOf(windowSeconds));
            if (!Long.valueOf(1L).equals(allowed)) {
                throw new TooManyRequestsException("Too many requests. Please try again later.");
            }
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Public rate limiter unavailable, failing open [bucket={}]: {}",
                    bucketFor(request.getRequestURI()), e.getMessage());
        }
        return true;
    }

    private static String bucketFor(String uri) {
        if (uri.startsWith("/v1/experience/public/investor/")) {
            return "experience:investor";
        }
        if (uri.startsWith("/v1/experience/public/demo/")) {
            return "experience:demo";
        }
        if (uri.startsWith("/v1/experience/public/events")) {
            return "experience:events";
        }
        if (uri.startsWith("/v1/public/website")) {
            return "public:website";
        }
        if (uri.startsWith("/v1/payment/webhooks/")) {
            return "payment:webhooks";
        }
        return "public:general";
    }
}
