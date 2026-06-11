package com.cloudcampus.identity.accesscontrol.policy;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.identity.accesscontrol.guard.AuthorizationGuard;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RoutePolicyEnforcementInterceptorTest {

    private final RoutePolicyRegistry routePolicyRegistry = mock(RoutePolicyRegistry.class);
    private final RequestContextResolver requestContextResolver = mock(RequestContextResolver.class);
    private final AuthorizationGuard authorizationGuard = mock(AuthorizationGuard.class);

    private RoutePolicyEnforcementInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new RoutePolicyEnforcementInterceptor(routePolicyRegistry, requestContextResolver, authorizationGuard);
    }

    @Test
    void publicLoginEndpointIsAllowedWithoutAuthentication() {
        MockHttpServletRequest request = request("POST", "/v1/auth/login");
        when(routePolicyRegistry.policyFor(HttpMethod.POST, "/v1/auth/login"))
                .thenReturn(Optional.of(publicPolicy(HttpMethod.POST, "/v1/auth/login")));

        assertThatCode(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .doesNotThrowAnyException();
        verifyNoInteractions(requestContextResolver);
    }

    @Test
    void protectedEndpointWithoutAuthenticationFails() {
        MockHttpServletRequest request = request("GET", "/v1/me");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/me"))
                .thenReturn(Optional.of(protectedPolicy("/v1/me", Set.of("SCHOOL_ADMIN"), Set.of(), false)));
        when(requestContextResolver.requireContext(request))
                .thenThrow(new UnauthorizedException("Bearer access token is required."));

        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void protectedEndpointWithWrongRoleFails() {
        MockHttpServletRequest request = request("GET", "/v1/super-admin/dashboard/summary");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/super-admin/dashboard/summary"))
                .thenReturn(Optional.of(protectedPolicy("/v1/super-admin/**", Set.of("SUPER_ADMIN"), Set.of("MANAGE_PLATFORM"), false)));
        when(requestContextResolver.requireContext(request))
                .thenReturn(context(Set.of("TENANT_ADMIN"), Set.of("MANAGE_PLATFORM"), null, false));

        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void protectedEndpointWithRequiredRoleSucceeds() {
        MockHttpServletRequest request = request("GET", "/v1/super-admin/dashboard/summary");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/super-admin/dashboard/summary"))
                .thenReturn(Optional.of(protectedPolicy("/v1/super-admin/**", Set.of("SUPER_ADMIN"), Set.of("MANAGE_PLATFORM"), false)));
        when(requestContextResolver.requireContext(request))
                .thenReturn(context(Set.of("SUPER_ADMIN"), Set.of(), null, true));

        assertThatCode(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .doesNotThrowAnyException();
    }

    @Test
    void protectedEndpointWithRequiredPermissionSucceedsForNonRoleLockedRoute() {
        MockHttpServletRequest request = request("POST", "/v1/ai/knowledge/search");
        when(routePolicyRegistry.policyFor(HttpMethod.POST, "/v1/ai/knowledge/search"))
                .thenReturn(Optional.of(protectedPolicy("/v1/ai/**", Set.of("TEACHER"), Set.of("VIEW_AI_RECOMMENDATIONS"), false)));
        when(requestContextResolver.requireContext(request))
                .thenReturn(context(Set.of("SCHOOL_ADMIN"), Set.of("VIEW_AI_RECOMMENDATIONS"), null, false));

        assertThatCode(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .doesNotThrowAnyException();
    }

    @Test
    void unregisteredVersionedRouteFailsClosed() {
        MockHttpServletRequest request = request("GET", "/v1/new-route");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/new-route"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void tenantAdminRouteRejectsSchoolOnlyUser() {
        MockHttpServletRequest request = request("GET", "/v1/tenant-admin/settings");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/tenant-admin/settings"))
                .thenReturn(Optional.of(protectedPolicy("/v1/tenant-admin/**", Set.of("TENANT_ADMIN"), Set.of("MANAGE_TENANT"), false)));
        when(requestContextResolver.requireContext(request))
                .thenReturn(context(Set.of("SCHOOL_ADMIN"), Set.of("MANAGE_TENANT"), null, false));

        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void schoolAdminRouteRejectsTenantOnlyUser() {
        MockHttpServletRequest request = request("GET", "/v1/school-admin/settings");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/school-admin/settings"))
                .thenReturn(Optional.of(protectedPolicy("/v1/school-admin/**", Set.of("SCHOOL_ADMIN"), Set.of("MANAGE_SCHOOL"), true)));
        when(requestContextResolver.requireContext(request))
                .thenReturn(context(Set.of("TENANT_ADMIN"), Set.of("MANAGE_SCHOOL"), UUID.randomUUID(), false));

        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void financeRouteRejectsNonFinanceUser() {
        MockHttpServletRequest request = request("GET", "/v1/finance/fees/demands");
        when(routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/finance/fees/demands"))
                .thenReturn(Optional.of(protectedPolicy("/v1/finance/**", Set.of("FINANCE_STAFF"), Set.of("VIEW_FINANCE_DASHBOARD"), true)));
        when(requestContextResolver.requireContext(request))
                .thenReturn(context(Set.of("TEACHER"), Set.of("VIEW_FINANCE_DASHBOARD"), UUID.randomUUID(), false));

        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(ForbiddenException.class);
    }

    private MockHttpServletRequest request(String method, String path) {
        return new MockHttpServletRequest(method, path);
    }

    private RoutePolicy publicPolicy(HttpMethod method, String path) {
        return new RoutePolicy(method, path, RoutePolicyType.PUBLIC, Set.of(), Set.of(), false, false, false, "test public route");
    }

    private RoutePolicy protectedPolicy(String path, Set<String> roles, Set<String> permissions, boolean schoolScoped) {
        return new RoutePolicy(null, path, RoutePolicyType.PROTECTED, roles, permissions, true, schoolScoped, false, "test protected route");
    }

    private RequestContext context(Set<String> roles, Set<String> permissions, UUID activeSchoolId, boolean superAdmin) {
        return new RequestContext(
                UUID.randomUUID(),
                UUID.randomUUID(),
                activeSchoolId,
                roles,
                permissions,
                "test-correlation",
                "unit-test",
                superAdmin
        );
    }
}
