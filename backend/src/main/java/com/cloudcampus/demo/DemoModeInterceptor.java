package com.cloudcampus.demo;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Base64;
import java.util.Set;

/**
 * Read-only guard for the JNV Lucknow demo tenant.
 *
 * Any write request (POST / PUT / PATCH / DELETE) whose JWT carries the
 * demo tenant ID is rejected with 403.  Auth endpoints are always allowed
 * so that users can log in and refresh tokens.
 *
 * JWT claim extraction is intentionally done without signature verification —
 * we are only using the claim to decide whether to apply the demo guard.
 * Security (signature validation) is still enforced by the JWT filter upstream.
 */
@Component
public class DemoModeInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(DemoModeInterceptor.class);

    private static final Set<String> WRITE_METHODS =
        Set.of(HttpMethod.POST.name(), HttpMethod.PUT.name(),
               HttpMethod.PATCH.name(), HttpMethod.DELETE.name());

    private static final Set<String> ALLOWED_PREFIXES =
        Set.of("/v1/auth/", "/v1/public/", "/actuator/");

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws IOException {

        if (!WRITE_METHODS.contains(request.getMethod())) return true;

        String uri = request.getRequestURI();
        for (String prefix : ALLOWED_PREFIXES) {
            if (uri.startsWith(prefix)) return true;
        }

        String tenantId = extractTenantIdFromJwt(request);
        if (DemoConstants.TENANT_ID.toString().equals(tenantId)) {
            log.warn("DEMO: blocked write attempt [method={}, uri={}]", request.getMethod(), uri);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("""
                {"success":false,"error":{"code":"DEMO_READ_ONLY",\
                "message":"This is a read-only demo environment. Write operations are disabled."}}""");
            return false;
        }

        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Decodes the JWT payload (middle segment) and extracts the {@code tenantId} claim.
     * Returns {@code null} if the header is absent or malformed.
     */
    private static String extractTenantIdFromJwt(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;

        String[] parts = auth.substring(7).split("\\.");
        if (parts.length < 2) return null;

        try {
            String payload = new String(Base64.getUrlDecoder().decode(
                    parts[1].replaceAll("[^A-Za-z0-9+/=_-]", "")));
            // Simple regex extract — avoids pulling in a JSON lib (claim key is "tenant_id")
            var matcher = java.util.regex.Pattern
                .compile("\"tenant_id\"\\s*:\\s*\"([^\"]+)\"")
                .matcher(payload);
            return matcher.find() ? matcher.group(1) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
