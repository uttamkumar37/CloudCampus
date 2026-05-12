package com.cloudcampus.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * C-09: Security headers filter.
 *
 * Adds OWASP-recommended HTTP security headers to every response.
 * Applied before Spring Security's own headers to ensure they are always present,
 * even if the security filter chain configuration changes.
 *
 * Headers added:
 *   X-Content-Type-Options       — prevents MIME-type sniffing
 *   X-Frame-Options              — clickjacking protection
 *   X-XSS-Protection             — legacy XSS filter (belt-and-suspenders)
 *   Referrer-Policy              — controls referrer information leakage
 *   Permissions-Policy           — disables unneeded browser features
 *   Strict-Transport-Security    — forces HTTPS (only meaningful over TLS)
 *   Cache-Control                — prevents caching of API responses by proxies
 *
 * NOT adding Content-Security-Policy here — it is configured per-page in the frontend.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Prevent MIME-type confusion attacks.
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Deny embedding in iframes — prevents clickjacking.
        response.setHeader("X-Frame-Options", "DENY");

        // Belt-and-suspenders XSS header for older browsers.
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Do not send the full URL as Referer to third-party sites.
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Disable browser features not needed by the API (camera, mic, geolocation from API server).
        response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()");

        // Force HTTPS for 1 year; include subdomains.
        // Safe for HTTPS-only endpoints. Omit this header if the endpoint can serve HTTP.
        response.setHeader("Strict-Transport-Security",
                "max-age=31536000; includeSubDomains");

        // API responses must not be cached by browsers or CDN proxies.
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        response.setHeader("Pragma", "no-cache");

        filterChain.doFilter(request, response);
    }
}
