package com.cloudcampus.common.web;

import com.cloudcampus.common.api.ApiError;
import com.cloudcampus.common.api.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Returns a JSON {@link ApiResponse} error body for Spring Security rejections.
 *
 * Without this, Spring Security writes its default HTML error page (or a plain-text
 * message) which breaks API clients expecting JSON.
 *
 * Handles two cases:
 *   AuthenticationEntryPoint — request has no / invalid credentials → HTTP 401
 *   AccessDeniedHandler     — authenticated but insufficient role    → HTTP 403
 *
 * Wire both into SecurityConfig via:
 *   http.exceptionHandling(ex -> ex
 *       .authenticationEntryPoint(jsonAuthEntryPoint)
 *       .accessDeniedHandler(jsonAuthEntryPoint)
 *   )
 */
@Component
public class JsonAuthEntryPoint
        implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public JsonAuthEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        writeError(response,
                HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED",
                "Authentication required");
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {

        writeError(response,
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "Insufficient permissions");
    }

    private void writeError(
            HttpServletResponse response,
            HttpStatus status,
            String code,
            String message) throws IOException {

        String correlationId = MDC.get(CorrelationId.MDC_KEY);
        ApiResponse<?> body = ApiResponse.error(
                correlationId,
                ApiError.of(code, message));

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
