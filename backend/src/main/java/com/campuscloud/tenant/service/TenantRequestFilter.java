package com.campuscloud.tenant.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Locale;

@Slf4j
@Component
public class TenantRequestFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String tenantHeader = request.getHeader(TENANT_HEADER);

        try {
            if (StringUtils.hasText(tenantHeader)) {
                String normalizedTenant = tenantHeader.trim().toLowerCase(Locale.ROOT);
                TenantContext.setTenant(normalizedTenant);
                log.debug("Resolved tenant from request header: {}", normalizedTenant);
            } else {
                TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
