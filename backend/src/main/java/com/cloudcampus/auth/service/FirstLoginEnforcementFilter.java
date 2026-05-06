package com.cloudcampus.auth.service;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.user.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * FIXED: switched from @Autowired field injection (required=false) to constructor
 * injection via @RequiredArgsConstructor.  Previously, if beans were missing the
 * filter would silently skip first-login enforcement — a security hole.
 */
@Component
@RequiredArgsConstructor
public class FirstLoginEnforcementFilter extends OncePerRequestFilter {

    private static final List<String> ALLOWED_PREFIXES = List.of(
            "/api/v1/auth/credentials/",
            "/api/v1/auth/login",
            "/api/v1/auth/logout",
            "/api/v1/auth/me"
    );

    private final UserAccountRepository userAccountRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CloudCampusUserDetails campus) {
            if (campus.getUserId() != null) {
                boolean firstLoginRequired = userAccountRepository.findById(campus.getUserId())
                        .map(u -> u.isFirstLoginRequired())
                        .orElse(false);
                if (firstLoginRequired && !isAllowed(request.getRequestURI())) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(response.getWriter(),
                            ApiResponse.error("First login requires updating username and password"));
                    return;
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(String uri) {
        for (String prefix : ALLOWED_PREFIXES) {
            if (uri.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
}

