package com.cloudcampus.identity.accesscontrol.policy;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootTest
class RouteAuthorizationMatrixTest {

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping handlerMapping;

    @Autowired
    private RoutePolicyRegistry routePolicyRegistry;

    @Autowired
    private ObjectProvider<RoutePolicyEnforcementInterceptor> routePolicyEnforcementInterceptor;

    @Test
    void routePolicyEnforcementInterceptorIsRegisteredInApplicationContext() {
        assertThat(routePolicyEnforcementInterceptor.getIfAvailable())
                .as("RoutePolicyRegistry metadata must be enforced at runtime for /v1 routes.")
                .isNotNull();
    }

    @Test
    void exactPolicyMatchWinsOverWildcardPolicyMatch() {
        RoutePolicy currentUserPolicy = routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/me")
                .orElseThrow();
        RoutePolicy activeSchoolPolicy = routePolicyRegistry.policyFor(HttpMethod.GET, "/v1/me/schools")
                .orElseThrow();

        assertThat(currentUserPolicy.pathPattern()).isEqualTo("/v1/me");
        assertThat(currentUserPolicy.roles()).contains("GUEST");
        assertThat(activeSchoolPolicy.pathPattern()).isEqualTo("/v1/me/**");
        assertThat(activeSchoolPolicy.roles()).doesNotContain("GUEST");
    }

    @Test
    void everyVersionedApiRouteHasAuthorizationPolicyMetadata() {
        List<String> missingPolicies = versionedApiRoutes()
                .filter(route -> routePolicyRegistry.policyFor(route.method(), route.path()).isEmpty())
                .map(Route::key)
                .sorted()
                .toList();

        assertThat(missingPolicies)
                .as("Every /v1 route must be classified as public or protected in RoutePolicyRegistry.")
                .isEmpty();
    }

    @Test
    void onlyExplicitlyApprovedRoutesArePublic() {
        Set<String> actualPublicRoutes = versionedApiRoutes()
                .filter(route -> routePolicyRegistry.policyFor(route.method(), route.path())
                        .map(RoutePolicy::isPublic)
                        .orElse(false))
                .map(Route::key)
                .collect(Collectors.toSet());

        assertThat(actualPublicRoutes)
                .as("Public route surface must stay intentionally small.")
                .isEqualTo(routePolicyRegistry.publicEndpointKeys());
    }

    private Stream<Route> versionedApiRoutes() {
        return handlerMapping.getHandlerMethods().keySet().stream()
                .flatMap(this::routesFor)
                .filter(route -> route.path().startsWith("/v1/"));
    }

    private Stream<Route> routesFor(RequestMappingInfo info) {
        Collection<String> paths = pathsFor(info);
        Set<RequestMethod> requestMethods = info.getMethodsCondition().getMethods();
        if (requestMethods.isEmpty()) {
            return paths.stream().map(path -> new Route(null, path));
        }
        return paths.stream()
                .flatMap(path -> requestMethods.stream()
                        .map(requestMethod -> new Route(HttpMethod.valueOf(requestMethod.name()), path)));
    }

    private Collection<String> pathsFor(RequestMappingInfo info) {
        if (info.getPathPatternsCondition() != null) {
            return info.getPathPatternsCondition().getPatternValues();
        }
        if (info.getPatternsCondition() != null) {
            return info.getPatternsCondition().getPatterns();
        }
        return List.of();
    }

    private record Route(HttpMethod method, String path) {
        String key() {
            return (method == null ? "*" : method.name()) + " " + path;
        }
    }
}
