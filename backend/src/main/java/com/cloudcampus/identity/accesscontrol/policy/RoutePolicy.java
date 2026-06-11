package com.cloudcampus.identity.accesscontrol.policy;

import java.util.Set;

import org.springframework.http.HttpMethod;

public record RoutePolicy(
        HttpMethod method,
        String pathPattern,
        RoutePolicyType type,
        Set<String> roles,
        Set<String> permissions,
        boolean tenantScoped,
        boolean schoolScoped,
        boolean objectScoped,
        String notes
) {
    public RoutePolicy {
        roles = roles == null ? Set.of() : Set.copyOf(roles);
        permissions = permissions == null ? Set.of() : Set.copyOf(permissions);
    }

    public boolean appliesToMethod(HttpMethod requestMethod) {
        return method == null || method.equals(requestMethod);
    }

    public boolean isPublic() {
        return type == RoutePolicyType.PUBLIC;
    }
}
