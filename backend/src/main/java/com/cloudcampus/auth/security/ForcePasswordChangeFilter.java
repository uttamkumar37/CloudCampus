package com.cloudcampus.auth.security;

import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.web.RequestContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Enforces first-login password reset after JWT authentication has populated
 * {@link RequestContext}. Users flagged with force_password_change may only call
 * password/session maintenance endpoints until their password is changed.
 */
@Component
public class ForcePasswordChangeFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_PATHS = Set.of(
            "/v1/auth/change-password",
            "/v1/auth/logout",
            "/v1/auth/refresh",
            "/v1/auth/revoke-all"
    );

    private final UserRepository userRepository;

    public ForcePasswordChangeFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        UUID userId = RequestContext.getUserId();
        if (userId == null || isAllowed(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean passwordChangeRequired = userRepository.findById(userId)
                .map(user -> user.isForcePasswordChange())
                .orElse(false);

        if (!passwordChangeRequired) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("""
                {"success":false,"message":"Password change required before continuing"}
                """.trim());
    }

    private static boolean isAllowed(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String contextPath = request.getContextPath();
        String path = request.getRequestURI();
        if (contextPath != null && !contextPath.isBlank() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        return ALLOWED_PATHS.contains(path);
    }
}
