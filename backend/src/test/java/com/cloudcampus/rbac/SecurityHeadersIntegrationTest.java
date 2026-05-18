package com.cloudcampus.rbac;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TASK-005 — Security headers and CORS integration tests.
 *
 * Pins the HTTP security headers applied by SecurityHeadersFilter on every API response.
 * Uses /actuator/health as the probe endpoint — it is public (no auth required),
 * so the test exercises SecurityHeadersFilter without JWT complexity.
 *
 * Headers verified:
 *   X-Content-Type-Options:  nosniff
 *   X-Frame-Options:         DENY
 *   X-XSS-Protection:        0        (disables legacy IE XSS auditor)
 *   Referrer-Policy:         strict-origin-when-cross-origin
 *   Permissions-Policy:      camera=() present
 *   Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
 *   Cache-Control:           no-store present
 *
 * CORS verified:
 *   Allowed origin (*.cloudcampus.io) → preflight passes, ACAO header returned
 *   Disallowed origin (evil.example.com) → no ACAO header returned (Spring rejects silently)
 *   Explicit allowedHeaders — no wildcard '*' in Access-Control-Allow-Headers
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@DisplayName("TASK-005 — Security Headers and CORS Integration Tests")
class SecurityHeadersIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired MockMvc mockMvc;

    // ══════════════════════════════════════════════════════════════════════════
    // 1. Security headers — all must be present on every API response
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[headers] X-Content-Type-Options: nosniff is present")
    void header_xContentTypeOptions() throws Exception {
        String value = probeHeader("X-Content-Type-Options");
        assertThat(value).as("X-Content-Type-Options must be nosniff").isEqualTo("nosniff");
    }

    @Test
    @DisplayName("[headers] X-Frame-Options: DENY is present")
    void header_xFrameOptions() throws Exception {
        String value = probeHeader("X-Frame-Options");
        assertThat(value).as("X-Frame-Options must be DENY").isEqualTo("DENY");
    }

    @Test
    @DisplayName("[headers] X-XSS-Protection: 0 (IE XSS auditor disabled)")
    void header_xXssProtection() throws Exception {
        String value = probeHeader("X-XSS-Protection");
        assertThat(value)
                .as("X-XSS-Protection must be 0 — '1; mode=block' introduces IE XSS vulnerabilities")
                .isEqualTo("0");
    }

    @Test
    @DisplayName("[headers] Referrer-Policy: strict-origin-when-cross-origin is present")
    void header_referrerPolicy() throws Exception {
        String value = probeHeader("Referrer-Policy");
        assertThat(value)
                .as("Referrer-Policy must be strict-origin-when-cross-origin")
                .isEqualTo("strict-origin-when-cross-origin");
    }

    @Test
    @DisplayName("[headers] Permissions-Policy restricts camera, microphone, geolocation")
    void header_permissionsPolicy() throws Exception {
        String value = probeHeader("Permissions-Policy");
        assertThat(value)
                .as("Permissions-Policy must restrict camera")
                .contains("camera=()")
                .contains("microphone=()")
                .contains("geolocation=()");
    }

    @Test
    @DisplayName("[headers] Content-Security-Policy: default-src 'none'; frame-ancestors 'none'")
    void header_contentSecurityPolicy() throws Exception {
        String value = probeHeader("Content-Security-Policy");
        assertThat(value)
                .as("CSP must restrict all resource loading for REST API responses")
                .isNotNull()
                .contains("default-src 'none'")
                .contains("frame-ancestors 'none'");
    }

    @Test
    @DisplayName("[headers] Cache-Control prevents API response caching")
    void header_cacheControl() throws Exception {
        String value = probeHeader("Cache-Control");
        assertThat(value)
                .as("Cache-Control must prevent caching of API responses")
                .contains("no-store");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. CORS — preflight from allowed vs disallowed origin
    // ══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[cors] Preflight from *.cloudcampus.io origin is accepted")
    void cors_allowedOrigin_preflightAccepted() throws Exception {
        MvcResult result = mockMvc.perform(
                        options("/v1/auth/login")
                                .header("Origin", "https://app.cloudcampus.io")
                                .header("Access-Control-Request-Method", "POST")
                                .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isOk())
                .andReturn();

        String acao = result.getResponse().getHeader("Access-Control-Allow-Origin");
        assertThat(acao)
                .as("Allowed origin must be reflected in Access-Control-Allow-Origin")
                .isEqualTo("https://app.cloudcampus.io");
    }

    @Test
    @DisplayName("[cors] Preflight from disallowed origin is rejected — no ACAO header")
    void cors_disallowedOrigin_preflightRejected() throws Exception {
        MvcResult result = mockMvc.perform(
                        options("/v1/auth/login")
                                .header("Origin", "https://evil.example.com")
                                .header("Access-Control-Request-Method", "POST"))
                .andReturn();

        String acao = result.getResponse().getHeader("Access-Control-Allow-Origin");
        assertThat(acao)
                .as("Disallowed origin must not receive Access-Control-Allow-Origin header")
                .isNull();
    }

    @Test
    @DisplayName("[cors] Access-Control-Allow-Headers does not contain wildcard '*'")
    void cors_allowedHeadersAreExplicit_noWildcard() throws Exception {
        MvcResult result = mockMvc.perform(
                        options("/v1/auth/login")
                                .header("Origin", "https://app.cloudcampus.io")
                                .header("Access-Control-Request-Method", "POST")
                                .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isOk())
                .andReturn();

        String acah = result.getResponse().getHeader("Access-Control-Allow-Headers");
        assertThat(acah)
                .as("Access-Control-Allow-Headers must not be a wildcard '*'")
                .doesNotContain("*");
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private String probeHeader(String headerName) throws Exception {
        // /actuator/health is public — no auth token needed, exercises the full
        // SecurityHeadersFilter without JWT validation complexity.
        return mockMvc.perform(get("/actuator/health"))
                .andReturn()
                .getResponse()
                .getHeader(headerName);
    }
}
