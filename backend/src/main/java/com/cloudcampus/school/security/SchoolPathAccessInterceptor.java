package com.cloudcampus.school.security;

import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.service.UserSchoolAccessService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enforces school-level access for /v1/school-admin/schools/{schoolId}/... routes.
 *
 * URL RBAC proves the caller is a school/tenant/super admin. This interceptor
 * also proves a SCHOOL_ADMIN is allowed to administer the concrete school id in
 * the path.
 */
@Component
public class SchoolPathAccessInterceptor implements HandlerInterceptor {

    private static final Pattern SCHOOL_PATH = Pattern.compile(
            "^/v1/school-admin/schools/([0-9a-fA-F-]{36})(?:/.*)?$");

    private final UserSchoolAccessService userSchoolAccessService;

    public SchoolPathAccessInterceptor(UserSchoolAccessService userSchoolAccessService) {
        this.userSchoolAccessService = userSchoolAccessService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        Matcher matcher = SCHOOL_PATH.matcher(request.getRequestURI());
        if (!matcher.matches()) {
            return true;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ForbiddenException("School access denied");
        }
        if (hasRole(auth, "ROLE_SUPER_ADMIN") || hasRole(auth, "ROLE_TENANT_ADMIN")) {
            return true;
        }
        if (!hasRole(auth, "ROLE_SCHOOL_ADMIN")) {
            throw new ForbiddenException("School access denied");
        }

        UUID requestedSchoolId = UUID.fromString(matcher.group(1));
        UUID userId = RequestContext.getUserId();
        if (userId == null) {
            throw new ForbiddenException("School access denied");
        }

        String jwtSchoolId = RequestContext.getSchoolId();
        if (jwtSchoolId != null && requestedSchoolId.equals(UUID.fromString(jwtSchoolId))) {
            return true;
        }
        if (userSchoolAccessService.hasAccess(userId, requestedSchoolId)) {
            return true;
        }

        throw new ForbiddenException("School access denied");
    }

    private static boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> role.equals(a.getAuthority()));
    }
}
