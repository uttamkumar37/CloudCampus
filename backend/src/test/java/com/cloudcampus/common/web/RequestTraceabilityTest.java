package com.cloudcampus.common.web;

import com.cloudcampus.auth.security.JwtAuthenticationFilter;
import com.cloudcampus.auth.security.JwtDenylistService;
import com.cloudcampus.auth.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

@DisplayName("TASK-040 - request traceability")
class RequestTraceabilityTest {

    @AfterEach
    void cleanup() {
        RequestContext.clearAll();
        SecurityContextHolder.clearContext();
        MDC.clear();
    }

    @Test
    @DisplayName("RequestContext mirrors tenant, school, and user into MDC and clears them together")
    void requestContextMirrorsMdc() {
        UUID userId = UUID.randomUUID();
        String tenantId = UUID.randomUUID().toString();
        String schoolId = UUID.randomUUID().toString();

        RequestContext.setTenantId(tenantId);
        RequestContext.setSchoolId(schoolId);
        RequestContext.setUserId(userId);

        assertThat(MDC.get(RequestContext.MDC_TENANT_ID)).isEqualTo(tenantId);
        assertThat(MDC.get(RequestContext.MDC_SCHOOL_ID)).isEqualTo(schoolId);
        assertThat(MDC.get(RequestContext.MDC_USER_ID)).isEqualTo(userId.toString());

        RequestContext.clearAll();

        assertThat(MDC.get(RequestContext.MDC_TENANT_ID)).isNull();
        assertThat(MDC.get(RequestContext.MDC_SCHOOL_ID)).isNull();
        assertThat(MDC.get(RequestContext.MDC_USER_ID)).isNull();
    }

    @Test
    @DisplayName("Async task decorator propagates correlation, tenant, school, and user context")
    void taskDecoratorPropagatesTraceabilityContext() {
        UUID userId = UUID.randomUUID();
        String tenantId = UUID.randomUUID().toString();
        String schoolId = UUID.randomUUID().toString();
        String correlationId = "corr-" + UUID.randomUUID();

        MDC.put(CorrelationId.MDC_KEY, correlationId);
        RequestContext.setTenantId(tenantId);
        RequestContext.setSchoolId(schoolId);
        RequestContext.setUserId(userId);

        RequestContextTaskDecorator decorator = new RequestContextTaskDecorator();
        Runnable decorated = decorator.decorate(() -> {
            assertThat(MDC.get(CorrelationId.MDC_KEY)).isEqualTo(correlationId);
            assertThat(RequestContext.getTenantId()).isEqualTo(tenantId);
            assertThat(RequestContext.getSchoolId()).isEqualTo(schoolId);
            assertThat(RequestContext.getUserId()).isEqualTo(userId);
            assertThat(MDC.get(RequestContext.MDC_TENANT_ID)).isEqualTo(tenantId);
            assertThat(MDC.get(RequestContext.MDC_SCHOOL_ID)).isEqualTo(schoolId);
            assertThat(MDC.get(RequestContext.MDC_USER_ID)).isEqualTo(userId.toString());
        });

        RequestContext.clearAll();
        MDC.clear();
        decorated.run();

        assertThat(RequestContext.getTenantId()).isNull();
        assertThat(RequestContext.getSchoolId()).isNull();
        assertThat(RequestContext.getUserId()).isNull();
        assertThat(MDC.get(CorrelationId.MDC_KEY)).isNull();
    }

    @Test
    @DisplayName("JWT filter exposes tenant, school, and user context during request and clears it afterward")
    void jwtFilterPopulatesAndClearsTraceabilityContext() throws Exception {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        JwtDenylistService denylistService = mock(JwtDenylistService.class);
        Claims claims = mock(Claims.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtUtil, denylistService);

        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        String token = "signed.jwt.token";

        given(jwtUtil.validateAndParse(token)).willReturn(Optional.of(claims));
        given(jwtUtil.extractUserId(claims)).willReturn(Optional.of(userId));
        given(jwtUtil.extractTenantId(claims)).willReturn(Optional.of(tenantId));
        given(jwtUtil.extractRole(claims)).willReturn(Optional.of("SCHOOL_ADMIN"));
        given(claims.getId()).willReturn(UUID.randomUUID().toString());
        given(claims.getExpiration()).willReturn(Date.from(java.time.Instant.now().plusSeconds(300)));
        given(claims.get(eq("school_id"), eq(String.class))).willReturn(schoolId.toString());

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v1/school-admin/dashboard");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainReached = new AtomicBoolean(false);

        FilterChain chain = (servletRequest, servletResponse) -> {
            chainReached.set(true);
            assertThat(RequestContext.getUserId()).isEqualTo(userId);
            assertThat(RequestContext.getTenantId()).isEqualTo(tenantId.toString());
            assertThat(RequestContext.getSchoolId()).isEqualTo(schoolId.toString());
            assertThat(MDC.get(RequestContext.MDC_USER_ID)).isEqualTo(userId.toString());
            assertThat(MDC.get(RequestContext.MDC_TENANT_ID)).isEqualTo(tenantId.toString());
            assertThat(MDC.get(RequestContext.MDC_SCHOOL_ID)).isEqualTo(schoolId.toString());
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        };

        filter.doFilter(request, response, chain);

        assertThat(chainReached).isTrue();
        assertThat(RequestContext.getUserId()).isNull();
        assertThat(RequestContext.getTenantId()).isNull();
        assertThat(RequestContext.getSchoolId()).isNull();
        assertThat(MDC.get(RequestContext.MDC_USER_ID)).isNull();
        assertThat(MDC.get(RequestContext.MDC_TENANT_ID)).isNull();
        assertThat(MDC.get(RequestContext.MDC_SCHOOL_ID)).isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("JWT filter clears stale request context before unauthenticated requests")
    void jwtFilterClearsStaleContextBeforeAnonymousRequest() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(mock(JwtUtil.class), mock(JwtDenylistService.class));

        RequestContext.setTenantId(UUID.randomUUID().toString());
        RequestContext.setUserId(UUID.randomUUID());
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v1/public/website");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> {
            assertThat(RequestContext.getTenantId()).isNull();
            assertThat(RequestContext.getUserId()).isNull();
            assertThat(MDC.get(RequestContext.MDC_TENANT_ID)).isNull();
            assertThat(MDC.get(RequestContext.MDC_USER_ID)).isNull();
        });
    }
}
