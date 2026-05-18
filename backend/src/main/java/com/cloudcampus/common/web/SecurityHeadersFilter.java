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
 *   X-XSS-Protection             — set to 0 (disables buggy IE XSS auditor; deprecated header)
 *   Referrer-Policy              — controls referrer information leakage
 *   Permissions-Policy           — disables unneeded browser features
 *   Strict-Transport-Security    — forces HTTPS; sent only when request is already over TLS
 *   Cache-Control                — prevents caching of API responses by proxies
 *   Content-Security-Policy      — restricts resource loading for REST API responses
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

        // Disable the legacy XSS auditor — value "0" is correct. The old "1; mode=block"
        // value introduced reflected-XSS vulnerabilities in IE. Modern browsers have
        // removed the XSS auditor entirely; this header is kept only for old IE compatibility.
        response.setHeader("X-XSS-Protection", "0");

        // Do not send the full URL as Referer to third-party sites.
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Disable browser features not needed by the API.
        response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()");

        // HSTS is only meaningful and safe over TLS — do not send on plaintext HTTP,
        // because a man-in-the-middle can strip the header before it reaches the client.
        if (request.isSecure()) {
            response.setHeader("Strict-Transport-Security",
                    "max-age=31536000; includeSubDomains");
        }

        // API responses must not be cached by browsers or CDN proxies.
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        response.setHeader("Pragma", "no-cache");

        // CSP for REST API responses: no HTML is served, so 'none' is appropriate.
        // frame-ancestors 'none' replaces X-Frame-Options for modern browsers.
        response.setHeader("Content-Security-Policy",
                "default-src 'none'; frame-ancestors 'none'");

        filterChain.doFilter(request, response);
    }
}
