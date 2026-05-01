package com.cloudcampus.tenant.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenantRequestFilter extends OncePerRequestFilter {

    private static final String DEFAULT_TENANT_HEADER = "X-Tenant-Slug";
    private static final String DEFAULT_LEGACY_TENANT_HEADER = "X-Tenant-ID";

    private final TenantService tenantService;

    @Value("${app.tenant.subdomain.enabled:true}")
    private boolean subdomainEnabled;

    @Value("${app.tenant.header-name:X-Tenant-Slug}")
    private String tenantHeaderName;

    @Value("${app.tenant.legacy-header-name:X-Tenant-ID}")
    private String legacyTenantHeaderName;

    @Value("${app.tenant.subdomain.root-domains:localhost}")
    private String configuredRootDomains;

    @Value("${app.tenant.subdomain.reserved-labels:www,app,api,admin,super-admin}")
    private String configuredReservedLabels;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // ✅ Skip preflight requests (CORS)
            if (HttpMethod.OPTIONS.matches(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            String tenantIdentifier = resolveTenantIdentifier(request);

            if (StringUtils.hasText(tenantIdentifier)) {
                String normalizedTenant = tenantService.resolveSchemaByTenantIdentifier(tenantIdentifier);
                TenantContext.setTenant(normalizedTenant);
                log.debug("Resolved tenant schema: identifier={}, schema={}", tenantIdentifier, normalizedTenant);
            } else {
                // ✅ fallback to default (public)
                TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);
                log.debug("No tenant header found, using default schema: {}",
                        TenantContext.DEFAULT_SCHEMA);
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String resolveTenantIdentifier(HttpServletRequest request) {
        String tenantHeader = request.getHeader(resolvePrimaryHeaderName());
        if (!StringUtils.hasText(tenantHeader)) {
            tenantHeader = request.getHeader(resolveLegacyHeaderName());
        }
        if (StringUtils.hasText(tenantHeader)) {
            return tenantHeader.trim().toLowerCase(Locale.ROOT);
        }

        if (!subdomainEnabled) {
            return null;
        }

        String host = request.getServerName();
        if (!StringUtils.hasText(host)) {
            host = request.getHeader("Host");
        }
        if (!StringUtils.hasText(host)) {
            return null;
        }

        String normalizedHost = host.trim().toLowerCase(Locale.ROOT);
        int portSeparator = normalizedHost.indexOf(':');
        if (portSeparator >= 0) {
            normalizedHost = normalizedHost.substring(0, portSeparator);
        }

        return extractTenantSlugFromHost(normalizedHost);
    }

    private String resolvePrimaryHeaderName() {
        return StringUtils.hasText(tenantHeaderName) ? tenantHeaderName : DEFAULT_TENANT_HEADER;
    }

    private String resolveLegacyHeaderName() {
        return StringUtils.hasText(legacyTenantHeaderName) ? legacyTenantHeaderName : DEFAULT_LEGACY_TENANT_HEADER;
    }

    private String extractTenantSlugFromHost(String host) {
        Set<String> reservedLabels = csvToSet(configuredReservedLabels);

        if (host.endsWith(".localhost")) {
            String candidate = host.substring(0, host.length() - ".localhost".length());
            if (StringUtils.hasText(candidate) && !candidate.contains(".") && !reservedLabels.contains(candidate)) {
                return candidate;
            }
            return null;
        }

        for (String rootDomain : csvToSet(configuredRootDomains)) {
            if (!StringUtils.hasText(rootDomain) || "localhost".equals(rootDomain)) {
                continue;
            }

            String suffix = "." + rootDomain;
            if (!host.endsWith(suffix)) {
                continue;
            }

            String candidate = host.substring(0, host.length() - suffix.length());
            if (!StringUtils.hasText(candidate) || candidate.contains(".")) {
                return null;
            }
            if (reservedLabels.contains(candidate)) {
                return null;
            }
            return candidate;
        }

        return null;
    }

    private Set<String> csvToSet(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toCollection(HashSet::new));
    }
}
