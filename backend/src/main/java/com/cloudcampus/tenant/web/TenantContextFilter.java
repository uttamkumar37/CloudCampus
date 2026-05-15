package com.cloudcampus.tenant.web;

import com.cloudcampus.common.web.RequestContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantContextFilter extends OncePerRequestFilter {
    private final TenantResolver tenantResolver;

    public TenantContextFilter(TenantResolver tenantResolver) {
        this.tenantResolver = tenantResolver;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator") || path.startsWith("/v1/public");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // The Spring Security filter chain (JwtAuthenticationFilter) runs before this
            // filter and may have already populated RequestContext with the UUID from the JWT
            // tenant_id claim. Only fall back to the raw header value when the JWT filter
            // didn't set anything (e.g. unauthenticated requests like login).
            tenantResolver.resolveTenantId(request).ifPresent(headerTenantId -> {
                if (RequestContext.getTenantId() == null) {
                    RequestContext.setTenantId(headerTenantId);
                }
            });
            tenantResolver.resolveSchoolId(request).ifPresent(headerSchoolId -> {
                if (RequestContext.getSchoolId() == null) {
                    RequestContext.setSchoolId(headerSchoolId);
                }
            });
            filterChain.doFilter(request, response);
        } finally {
            RequestContext.clearAll();
        }
    }
}

