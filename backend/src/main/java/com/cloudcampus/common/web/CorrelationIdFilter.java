package com.cloudcampus.common.web;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

import com.cloudcampus.common.context.RequestContextAttributes;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String RESPONSE_HEADER = "X-Correlation-Id";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";
    private static final int MAX_CORRELATION_ID_LENGTH = 120;
    private static final Pattern SAFE_CORRELATION_ID = Pattern.compile("[A-Za-z0-9._:-]{1,120}");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String correlationId = resolvedCorrelationId(request);
        request.setAttribute(RequestContextAttributes.CORRELATION_ID, correlationId);
        response.setHeader(RESPONSE_HEADER, correlationId);
        MDC.put(CORRELATION_ID_MDC_KEY, correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(CORRELATION_ID_MDC_KEY);
        }
    }

    private String resolvedCorrelationId(HttpServletRequest request) {
        String supplied = firstNonBlank(
                request.getHeader("X-Correlation-Id"),
                request.getHeader("X-Correlation-ID"),
                request.getHeader("X-Request-Id"),
                request.getHeader("X-Request-ID")
        );
        if (isSafeCorrelationId(supplied)) {
            return supplied.trim();
        }
        return UUID.randomUUID().toString();
    }

    private boolean isSafeCorrelationId(String value) {
        if (value == null) {
            return false;
        }
        String candidate = value.trim();
        return candidate.length() <= MAX_CORRELATION_ID_LENGTH
                && SAFE_CORRELATION_ID.matcher(candidate).matches();
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate;
            }
        }
        return null;
    }
}
