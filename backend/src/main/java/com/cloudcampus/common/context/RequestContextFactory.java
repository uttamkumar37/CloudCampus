package com.cloudcampus.common.context;

import java.util.Set;
import java.util.UUID;

import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.AuthorizationService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
public class RequestContextFactory {

    private static final int MAX_CORRELATION_ID_LENGTH = 120;
    private static final int MAX_REQUEST_SOURCE_LENGTH = 160;

    private final AuthorizationService authorizationService;

    public RequestContextFactory(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    public RequestContext from(HttpServletRequest request, AuthenticatedUser authenticatedUser) {
        UserAccount user = authenticatedUser.user();
        String activeSchoolId = authenticatedUser.activeSchoolId();
        Set<String> roles = authorizationService.roleNamesFor(user);
        return new RequestContext(
                parseRequiredUuid(user.getId(), "userId"),
                parseRequiredUuid(user.getTenant().getId(), "tenantId"),
                parseOptionalUuid(activeSchoolId, "activeSchoolId"),
                roles,
                authorizationService.effectivePermissionCodesFor(user, user.getTenant().getId(), activeSchoolId),
                correlationId(request),
                requestSource(request),
                roles.contains("SUPER_ADMIN")
        );
    }

    private UUID parseRequiredUuid(String value, String fieldName) {
        UUID uuid = parseOptionalUuid(value, fieldName);
        if (uuid == null) {
            throw new UnauthorizedException("Authenticated " + fieldName + " is missing.");
        }
        return uuid;
    }

    private UUID parseOptionalUuid(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("Authenticated " + fieldName + " is invalid.");
        }
    }

    private String correlationId(HttpServletRequest request) {
        Object resolvedCorrelationId = request.getAttribute(RequestContextAttributes.CORRELATION_ID);
        if (resolvedCorrelationId instanceof String correlationId && !correlationId.isBlank()) {
            return correlationId;
        }

        String supplied = firstNonBlank(
                request.getHeader("X-Correlation-Id"),
                request.getHeader("X-Correlation-ID"),
                request.getHeader("X-Request-Id"),
                request.getHeader("X-Request-ID")
        );
        return sanitizedOrDefault(supplied, UUID.randomUUID().toString(), MAX_CORRELATION_ID_LENGTH);
    }

    private String requestSource(HttpServletRequest request) {
        String supplied = firstNonBlank(
                request.getHeader("X-Request-Source"),
                request.getHeader("User-Agent"),
                request.getRemoteAddr()
        );
        return sanitizedOrDefault(supplied, "unknown", MAX_REQUEST_SOURCE_LENGTH);
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate;
            }
        }
        return null;
    }

    private String sanitizedOrDefault(String value, String fallback, int maxLength) {
        String candidate = value == null || value.isBlank() ? fallback : value.trim();
        StringBuilder sanitized = new StringBuilder();
        candidate.chars()
                .filter(character -> character >= 32 && character != 127)
                .limit(maxLength)
                .forEach(character -> sanitized.append((char) character));
        if (sanitized.isEmpty()) {
            return fallback;
        }
        return sanitized.toString();
    }
}
