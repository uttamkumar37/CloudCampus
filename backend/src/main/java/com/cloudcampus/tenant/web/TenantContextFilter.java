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
            tenantResolver.resolveTenantId(request).ifPresent(RequestContext::setTenantId);
            tenantResolver.resolveSchoolId(request).ifPresent(RequestContext::setSchoolId);
            filterChain.doFilter(request, response);
        } finally {
            RequestContext.clearAll();
        }
    }
}

