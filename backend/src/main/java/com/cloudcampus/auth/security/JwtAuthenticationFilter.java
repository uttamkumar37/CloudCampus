package com.cloudcampus.auth.security;

import com.cloudcampus.common.web.RequestContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * JWT authentication filter — runs once per request.
 *
 * Behaviour (Phase 1 — permit-all mode):
 *   - On VALID token   → populates SecurityContext + RequestContext. Request proceeds authenticated.
 *   - On MISSING token → does nothing. SecurityContext stays anonymous. Request proceeds (permit-all).
 *   - On INVALID token → clears SecurityContext. Request proceeds as anonymous (permit-all).
 *
 * Phase 2 (CC-0113): Once SecurityConfig moves to .anyRequest().authenticated(), requests
 * without a valid token will be rejected by Spring Security automatically — no changes needed here.
 *
 * Claims extracted:
 *   sub          → userId  (UUID)
 *   tenant_id    → tenantId UUID — also written to RequestContext for downstream tenant isolation
 *   school_id    → schoolId UUID — also written to RequestContext
 *   role         → ROLE_{role} granted authority
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTHORIZATION_HEADER = "Authorization";

    private final JwtUtil            jwtUtil;
    private final JwtDenylistService denylistService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, JwtDenylistService denylistService) {
        this.jwtUtil         = jwtUtil;
        this.denylistService = denylistService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        SecurityContextHolder.clearContext();
        RequestContext.clearAll();

        String token = extractBearerToken(request);

        try {
            if (token == null) {
                // No Authorization header — proceed as anonymous (permit-all Phase 1)
                filterChain.doFilter(request, response);
                return;
            }

            jwtUtil.validateAndParse(token).ifPresentOrElse(
                    claims -> authenticate(claims, request),
                    () -> {
                        // Token present but invalid/expired — clear any stale context
                        log.debug("Invalid or expired JWT on {} {}", request.getMethod(), request.getRequestURI());
                        SecurityContextHolder.clearContext();
                        RequestContext.clearAll();
                    }
            );

            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
            RequestContext.clearAll();
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void authenticate(Claims claims, HttpServletRequest request) {
        // H-02: reject tokens that have been explicitly revoked (e.g. via logout)
        String jti = claims.getId();
        if (jti != null && denylistService.isDenied(jti)) {
            log.debug("JWT jti {} is denylisted — treating as invalid", jti);
            SecurityContextHolder.clearContext();
            RequestContext.clearAll();
            return;
        }

        jwtUtil.extractUserId(claims).ifPresent(userId -> {
            String role = jwtUtil.extractRole(claims).orElse(null);
            if (role == null) {
                log.debug("JWT missing role claim — treating as anonymous");
                return;
            }

            // Populate SecurityContext
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + role)
            );
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId.toString(), null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Populate RequestContext for downstream use (tenant isolation, audit logs)
            RequestContext.setUserId(userId);
            jwtUtil.extractTenantId(claims)
                    .map(UUID::toString)
                    .ifPresent(RequestContext::setTenantId);

            // Extract schoolId claim (reuse same pattern as tenantId)
            String schoolIdStr = claims.get("school_id", String.class);
            if (schoolIdStr != null) {
                try {
                    UUID.fromString(schoolIdStr);  // validate format
                    RequestContext.setSchoolId(schoolIdStr);
                } catch (IllegalArgumentException ignored) {
                    log.debug("Invalid school_id claim format in JWT: {}", schoolIdStr);
                }
            }

            // H-02: store jti + expiry so logout can denylist this token
            RequestContext.setJwtJti(jti);
            if (claims.getExpiration() != null) {
                RequestContext.setJwtExpiry(claims.getExpiration().toInstant());
            }

            log.debug("Authenticated user={} role={} tenant={}", userId, role,
                    RequestContext.getTenantId());
        });
    }

    /**
     * Extract the raw token string from the Authorization header.
     * Returns null if the header is absent or not a Bearer token.
     */
    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
