package com.cloudcampus.identity.accesscontrol.policy;

import java.util.Locale;
import java.util.Set;

import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.guard.AuthorizationGuard;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@ConditionalOnBean(RoutePolicyRegistry.class)
public class RoutePolicyEnforcementInterceptor implements HandlerInterceptor {

    private final RoutePolicyRegistry routePolicyRegistry;
    private final RequestContextResolver requestContextResolver;
    private final AuthorizationGuard authorizationGuard;

    public RoutePolicyEnforcementInterceptor(
            RoutePolicyRegistry routePolicyRegistry,
            RequestContextResolver requestContextResolver,
            AuthorizationGuard authorizationGuard
    ) {
        this.routePolicyRegistry = routePolicyRegistry;
        this.requestContextResolver = requestContextResolver;
        this.authorizationGuard = authorizationGuard;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String path = requestPath(request);
        if (!path.startsWith("/v1/") || isCorsPreflight(request)) {
            return true;
        }

        HttpMethod method = requestMethod(request);
        RoutePolicy policy = routePolicyRegistry.policyFor(method, path)
                .orElseThrow(() -> new ForbiddenException("No route authorization policy is registered for this endpoint."));

        if (policy.isPublic()) {
            return true;
        }

        RequestContext context = requestContextResolver.requireContext(request);
        requireRouteAuthority(context, policy, path);
        requireSchoolScopeWhenApplicable(context, policy, path);
        return true;
    }

    private void requireRouteAuthority(RequestContext context, RoutePolicy policy, String path) {
        boolean hasRole = policy.roles().isEmpty() || containsAny(context.roles(), policy.roles());
        boolean hasPermission = policy.permissions().isEmpty() || containsAny(context.permissions(), policy.permissions());

        if (isRoleLockedNamespace(path) && !hasRole) {
            throw new ForbiddenException("Route role is required.");
        }
        if (!policy.roles().isEmpty() && !policy.permissions().isEmpty()) {
            if (!hasRole && !hasPermission) {
                throw new ForbiddenException("Route role or permission is required.");
            }
            return;
        }
        if (!hasRole) {
            throw new ForbiddenException("Route role is required.");
        }
        if (!hasPermission) {
            throw new ForbiddenException("Route permission is required.");
        }
    }

    private boolean isRoleLockedNamespace(String path) {
        return path.startsWith("/v1/super-admin/")
                || path.startsWith("/v1/tenant-admin/")
                || path.startsWith("/v1/school-admin/")
                || path.startsWith("/v1/teacher/")
                || path.startsWith("/v1/finance/")
                || path.startsWith("/v1/parent/")
                || path.startsWith("/v1/student/")
                || path.startsWith("/v1/staff/");
    }

    private void requireSchoolScopeWhenApplicable(RequestContext context, RoutePolicy policy, String path) {
        if (!policy.schoolScoped() || !requiresActiveSchool(path)) {
            return;
        }
        authorizationGuard.requireUserSchoolAccess(context, authorizationGuard.requireActiveSchool(context));
    }

    private boolean requiresActiveSchool(String path) {
        return path.startsWith("/v1/school-admin/")
                || path.startsWith("/v1/teacher/")
                || path.startsWith("/v1/finance/")
                || path.startsWith("/v1/parent/")
                || path.startsWith("/v1/student/")
                || path.startsWith("/v1/staff/");
    }

    private boolean containsAny(Set<String> actualValues, Set<String> allowedValues) {
        return actualValues.stream()
                .map(this::normalize)
                .anyMatch(value -> allowedValues.stream().map(this::normalize).anyMatch(value::equals));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private HttpMethod requestMethod(HttpServletRequest request) {
        try {
            return HttpMethod.valueOf(request.getMethod());
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("HTTP method is not supported.");
        }
    }

    private String requestPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isBlank() && path.startsWith(contextPath)) {
            return path.substring(contextPath.length());
        }
        return path;
    }

    private boolean isCorsPreflight(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                && request.getHeader("Access-Control-Request-Method") != null;
    }
}
