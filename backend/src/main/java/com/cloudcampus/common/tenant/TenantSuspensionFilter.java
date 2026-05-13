package com.cloudcampus.common.tenant;

import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.tenant.entity.TenantStatus;
import com.cloudcampus.tenant.repository.TenantRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Rejects all API calls for SUSPENDED tenants with HTTP 403 (CC-0205).
 *
 * Runs immediately after JwtAuthenticationFilter so tenantId is already in
 * RequestContext. Skips check when tenantId is absent (public routes, Super Admin).
 *
 * Tenant status is cached in Redis for 60 s to avoid a DB hit on every request.
 * Cache is eagerly invalidated (or self-expires) when the admin suspends/reactivates
 * a tenant — the 60 s lag is acceptable.
 */
@Component
public class TenantSuspensionFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantSuspensionFilter.class);

    private static final String CACHE_PREFIX = "tenant:status:";
    private static final Duration CACHE_TTL   = Duration.ofSeconds(60);

    private final TenantRepository            tenantRepository;
    private final RedisTemplate<String,String> redis;

    public TenantSuspensionFilter(TenantRepository tenantRepository,
                                   @Qualifier("stringRedisTemplate") RedisTemplate<String,String> redis) {
        this.tenantRepository = tenantRepository;
        this.redis            = redis;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         chain) throws ServletException, IOException {

        String tenantId = RequestContext.getTenantId();

        if (tenantId == null) {
            // No tenant context — public route, Super Admin, or pre-auth request.
            chain.doFilter(request, response);
            return;
        }

        String status = resolveStatus(tenantId);

        if (TenantStatus.SUSPENDED.name().equals(status)) {
            log.warn("Rejected request for suspended tenant={} path={}",
                    tenantId, request.getRequestURI());
            sendSuspendedError(response);
            return;
        }

        chain.doFilter(request, response);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String resolveStatus(String tenantId) {
        String key = CACHE_PREFIX + tenantId;
        try {
            String cached = redis.opsForValue().get(key);
            if (cached != null) return cached;

            String status = tenantRepository.findById(UUID.fromString(tenantId))
                    .map(t -> t.getStatus().name())
                    .orElse(TenantStatus.ACTIVE.name());
            redis.opsForValue().set(key, status, CACHE_TTL);
            return status;
        } catch (Exception ex) {
            log.warn("TenantSuspensionFilter: could not resolve status for tenantId={}: {}",
                    tenantId, ex.getMessage());
            return TenantStatus.ACTIVE.name(); // fail-open for availability
        }
    }

    private static void sendSuspendedError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                "{\"success\":false,\"timestamp\":\"" + Instant.now() + "\"," +
                "\"error\":{\"code\":\"TENANT_SUSPENDED\"," +
                "\"message\":\"This account has been suspended. Please contact support.\"}}"
        );
    }
}
