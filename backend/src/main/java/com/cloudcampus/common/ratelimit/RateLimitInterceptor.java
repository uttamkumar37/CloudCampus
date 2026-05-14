package com.cloudcampus.common.ratelimit;

import com.cloudcampus.common.web.RequestContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Enforces {@link RateLimit} on annotated controller methods (CC-1805).
 *
 * Extracts userId from the Spring Security principal (set by JwtAuthenticationFilter)
 * and tenantId from RequestContext (also set by JwtAuthenticationFilter).
 *
 * Unauthenticated requests bypass the check — they are already blocked upstream by
 * the security filter chain before reaching this interceptor.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final ApiRateLimiterService rateLimiter;

    public RateLimitInterceptor(ApiRateLimiterService rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        if (!(handler instanceof HandlerMethod method)) return true;
        if (!method.hasMethodAnnotation(RateLimit.class)) return true;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return true;

        String userId   = auth.getName();            // userId UUID string (set by JwtAuthenticationFilter)
        String tenantId = RequestContext.getTenantId();

        if (userId == null || tenantId == null) return true;

        rateLimiter.checkAndRecord(userId, tenantId);
        return true;
    }
}
