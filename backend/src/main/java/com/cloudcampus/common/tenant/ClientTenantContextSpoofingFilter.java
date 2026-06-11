package com.cloudcampus.common.tenant;

import java.io.IOException;
import java.util.List;

import com.cloudcampus.common.web.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ClientTenantContextSpoofingFilter extends OncePerRequestFilter {

    static final String ERROR_CODE = "TENANT_CONTEXT_SPOOFING_BLOCKED";
    private static final List<String> BLOCKED_CONTEXT_HEADERS = List.of(
            "X-Tenant-ID",
            "X-School-ID",
            "X-Active-School-ID"
    );

    private final ObjectMapper objectMapper;

    public ClientTenantContextSpoofingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/v1/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String spoofedHeader = firstPresentContextHeader(request);
        if (spoofedHeader != null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), ApiErrorResponse.of(
                    ERROR_CODE,
                    spoofedHeader + " is not accepted as tenant or school context. Context must be resolved server-side."
            ));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String firstPresentContextHeader(HttpServletRequest request) {
        return BLOCKED_CONTEXT_HEADERS.stream()
                .filter(header -> request.getHeader(header) != null)
                .findFirst()
                .orElse(null);
    }
}
