package com.cloudcampus.common.context;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;

import com.cloudcampus.identity.accesscontrol.AuthorizationService;
import com.cloudcampus.identity.accesscontrol.Permission;
import com.cloudcampus.identity.accesscontrol.PermissionRepository;
import com.cloudcampus.identity.accesscontrol.UserPermissionOverride;
import com.cloudcampus.identity.accesscontrol.UserPermissionOverrideRepository;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccess;
import com.cloudcampus.identity.accesscontrol.UserSchoolAccessRepository;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserAccountRepository;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.JwtAccessTokenService;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.platform.tenant.TenantRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class RequestContextResolverTest {

    @Autowired
    private RequestContextResolver requestContextResolver;

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserSchoolAccessRepository userSchoolAccessRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private UserPermissionOverrideRepository userPermissionOverrideRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void resolvesAndCachesRequestContextWithServerDerivedScopeAndPermissions() {
        Fixture fixture = schoolAdminFixture("ctx-cache");
        MockHttpServletRequest request = authenticatedRequest(fixture, "ctx-test-123", "school-admin-web");

        RequestContext context = requestContextResolver.requireContext(request);
        RequestContext cachedContext = requestContextResolver.requireContext(request);

        assertThat(cachedContext).isSameAs(context);
        assertThat(request.getAttribute(RequestContextAttributes.REQUEST_CONTEXT)).isSameAs(context);
        assertThat(context.userId()).isEqualTo(UUID.fromString(fixture.user().getId()));
        assertThat(context.tenantId()).isEqualTo(UUID.fromString(fixture.tenant().getId()));
        assertThat(context.activeSchoolId()).isEqualTo(UUID.fromString(fixture.school().getId()));
        assertThat(context.correlationId()).isEqualTo("ctx-test-123");
        assertThat(context.requestSource()).isEqualTo("school-admin-web");
        assertThat(context.superAdmin()).isFalse();
        assertThat(context.hasActiveSchool()).isTrue();
        assertThat(context.isTenantScopedTo(UUID.fromString(fixture.tenant().getId()))).isTrue();
        assertThat(context.isSchoolScopedTo(UUID.fromString(fixture.school().getId()))).isTrue();
        assertThat(context.hasRole("SCHOOL_ADMIN")).isTrue();
        assertThat(context.hasPermission("MANAGE_SCHOOL")).isTrue();
        assertThat(context.permissions()).contains("VIEW_SCHOOL_DASHBOARD", "MANAGE_SCHOOL");
    }

    @Test
    void permissionDenyOverrideIsReflectedInRequestContextSnapshot() {
        Fixture fixture = schoolAdminFixture("ctx-deny");
        Permission manageSchool = permissionRepository.findByCode("MANAGE_SCHOOL").orElseThrow();
        userPermissionOverrideRepository.save(new UserPermissionOverride(
                fixture.user(),
                manageSchool,
                false,
                fixture.tenant(),
                fixture.school(),
                "SCHOOL",
                fixture.school().getId(),
                "Regression test deny override",
                null,
                null,
                fixture.user()
        ));

        RequestContext context = requestContextResolver.requireContext(authenticatedRequest(
                fixture,
                "ctx-deny-123",
                "school-admin-web"
        ));

        assertThat(context.hasRole("SCHOOL_ADMIN")).isTrue();
        assertThat(context.hasPermission("MANAGE_SCHOOL")).isFalse();
        assertThat(context.permissions()).doesNotContain("MANAGE_SCHOOL");
        assertThat(authorizationService.hasPermissionInSchool(
                fixture.user(),
                "MANAGE_SCHOOL",
                fixture.school().getId()
        )).isFalse();
    }

    private MockHttpServletRequest authenticatedRequest(Fixture fixture, String correlationId, String requestSource) {
        String token = jwtAccessTokenService.issueToken(
                fixture.user().getId(),
                fixture.tenant().getId(),
                fixture.user().getRole(),
                fixture.school().getId()
        );
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v1/school-admin/dashboard/summary");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        request.addHeader("X-Correlation-ID", correlationId);
        request.addHeader("X-Request-Source", requestSource);
        return request;
    }

    private Fixture schoolAdminFixture(String prefix) {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Tenant tenant = tenantRepository.save(new Tenant(
                (prefix + "-tenant-" + suffix).toUpperCase(),
                "Request Context Tenant " + suffix
        ));
        School school = schoolRepository.save(new School(
                tenant,
                (prefix + "-school-" + suffix).toUpperCase(),
                "Request Context School " + suffix,
                true
        ));
        UserAccount user = new UserAccount(
                tenant,
                prefix + "-" + suffix + "@context.example",
                "Request Context Admin",
                UserRole.SCHOOL_ADMIN
        );
        user.activate(passwordEncoder.encode("ContextStrong123!"), "Request Context Admin", Instant.now());
        user = userAccountRepository.save(user);
        userSchoolAccessRepository.save(new UserSchoolAccess(tenant, school, user, UserRole.SCHOOL_ADMIN, true));
        return new Fixture(tenant, school, user);
    }

    private record Fixture(
            Tenant tenant,
            School school,
            UserAccount user
    ) {
    }
}
