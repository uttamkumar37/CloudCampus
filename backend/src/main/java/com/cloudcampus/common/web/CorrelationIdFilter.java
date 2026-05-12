package com.cloudcampus.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    // C-03: Accept only safe characters in correlation ID to prevent log injection attacks.
    // RFC 4122 UUID format or alphanumeric+hyphen up to 64 chars.
    private static final Pattern SAFE_CORRELATION_ID = Pattern.compile("^[a-zA-Z0-9\\-]{1,64}$");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String incoming = request.getHeader(CorrelationId.HEADER);
        String correlationId = sanitize(incoming);
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put(CorrelationId.MDC_KEY, correlationId);
        response.setHeader(CorrelationId.HEADER, correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(CorrelationId.MDC_KEY);
        }
    }

    private String sanitize(String value) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        if (!SAFE_CORRELATION_ID.matcher(trimmed).matches()) return null;
        return trimmed;
    }
}

