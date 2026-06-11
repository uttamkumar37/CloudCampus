package com.cloudcampus.identity.accesscontrol.policy;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

@Component
public class RoutePolicyRegistry {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final List<RoutePolicy> policies = List.of(
            publicRoute(HttpMethod.POST, "/v1/auth/login", "Password login issues short-lived access and refresh tokens."),
            publicRoute(HttpMethod.POST, "/v1/auth/mfa/verify", "MFA verification completes login without an existing session."),
            publicRoute(HttpMethod.POST, "/v1/auth/refresh", "Refresh endpoint authenticates with refresh token material."),
            publicRoute(HttpMethod.POST, "/v1/auth/forgot-password", "Password recovery starts from a public identifier."),
            publicRoute(HttpMethod.POST, "/v1/auth/reset-password", "Password reset authenticates with reset token material."),
            publicRoute(HttpMethod.POST, "/v1/invitations/accept", "Invitation acceptance authenticates with invitation token material."),
            publicRoute(HttpMethod.GET, "/v1/system/readiness", "Readiness is intentionally public for deployment checks."),

            protectedRoute("/v1/me", roles("SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER",
                    "STUDENT", "PARENT", "FINANCE_STAFF", "OFFICE_STAFF", "STAFF", "GUEST"), Set.of(), true, false, false,
                    "Current-user session surface."),
            protectedRoute("/v1/me/**", roles("SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER",
                    "STUDENT", "PARENT", "FINANCE_STAFF", "OFFICE_STAFF", "STAFF"), Set.of(), true, true, true,
                    "Current-user session and active-school surface."),
            protectedRoute("/v1/super-admin/**", roles("SUPER_ADMIN"), permissions("MANAGE_PLATFORM"), false, false, true,
                    "Platform control plane and cross-tenant reporting."),
            protectedRoute("/v1/tenant-admin/**", roles("TENANT_ADMIN"), permissions("MANAGE_TENANT"), true, false, true,
                    "Tenant control plane; school path variables remain object-scoped."),
            protectedRoute("/v1/school-admin/fees/**", roles("SCHOOL_ADMIN", "FINANCE_STAFF"),
                    permissions("VIEW_FINANCE_DASHBOARD", "MANAGE_FEE_STRUCTURE"), true, true, true,
                    "School finance operations."),
            protectedRoute("/v1/school-admin/reports/**", roles("SCHOOL_ADMIN", "PRINCIPAL"),
                    permissions("VIEW_REPORTS", "EXPORT_REPORTS"), true, true, true,
                    "School report export and download operations."),
            protectedRoute("/v1/school-admin/students/**", roles("SCHOOL_ADMIN", "PRINCIPAL", "OFFICE_STAFF", "STAFF"),
                    permissions("MANAGE_SCHOOL", "MANAGE_STUDENT_DOCUMENTS"), true, true, true,
                    "Student administration and imports."),
            protectedRoute("/v1/school-admin/documents/**", roles("SCHOOL_ADMIN", "OFFICE_STAFF", "STAFF"),
                    permissions("MANAGE_STUDENT_DOCUMENTS"), true, true, true,
                    "School document management."),
            protectedRoute("/v1/school-admin/ai/**", roles("SCHOOL_ADMIN", "PRINCIPAL"),
                    permissions("VIEW_AI_RECOMMENDATIONS", "MANAGE_AI_POLICY"), true, true, true,
                    "School-scoped AI knowledge management."),
            protectedRoute("/v1/school-admin/**", roles("SCHOOL_ADMIN", "PRINCIPAL", "OFFICE_STAFF", "STAFF"),
                    permissions("MANAGE_SCHOOL", "VIEW_SCHOOL_DASHBOARD"), true, true, true,
                    "School administration namespace."),
            protectedRoute("/v1/teacher/**", roles("TEACHER"), permissions("VIEW_ACADEMIC_DATA", "MANAGE_HOMEWORK"),
                    true, true, true, "Teacher namespace with class or section object guards."),
            protectedRoute("/v1/finance/**", roles("FINANCE_STAFF", "SCHOOL_ADMIN"),
                    permissions("VIEW_FINANCE_DASHBOARD", "VIEW_FINANCE_REPORTS", "EXPORT_FINANCE_REPORTS"),
                    true, true, true, "Finance namespace."),
            protectedRoute("/v1/parent/**", roles("PARENT"), permissions("VIEW_CHILD_PROFILE"), true, true, true,
                    "Parent namespace guarded by linked-child relationships."),
            protectedRoute("/v1/student/**", roles("STUDENT"), permissions("VIEW_OWN_PROFILE"), true, true, true,
                    "Student namespace guarded by active student-user links."),
            protectedRoute("/v1/staff/**", roles("OFFICE_STAFF", "STAFF"), permissions("VIEW_SCHOOL_DASHBOARD"),
                    true, true, true, "Staff namespace."),
            protectedRoute("/v1/ai/**", roles("TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT",
                    "PARENT", "FINANCE_STAFF", "OFFICE_STAFF", "STAFF", "SYSTEM", "AI_AGENT"),
                    permissions("VIEW_AI_RECOMMENDATIONS"), true, true, true,
                    "Role-scoped AI recommendations, usage, and retrieval.")
    );

    public Optional<RoutePolicy> policyFor(HttpMethod method, String path) {
        return policies.stream()
                .filter(policy -> policy.appliesToMethod(method))
                .filter(policy -> pathMatcher.match(policy.pathPattern(), path))
                .max(Comparator.comparingInt(policy -> matchScore(policy, path)));
    }

    public List<RoutePolicy> policies() {
        return policies;
    }

    public Set<String> publicEndpointKeys() {
        return policies.stream()
                .filter(RoutePolicy::isPublic)
                .map(this::key)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    public String key(RoutePolicy policy) {
        String method = policy.method() == null ? "*" : policy.method().name();
        return method + " " + policy.pathPattern();
    }

    private RoutePolicy publicRoute(HttpMethod method, String path, String notes) {
        return new RoutePolicy(method, path, RoutePolicyType.PUBLIC, Set.of(), Set.of(), false, false, false, notes);
    }

    private RoutePolicy protectedRoute(
            String pathPattern,
            Set<String> roles,
            Set<String> permissions,
            boolean tenantScoped,
            boolean schoolScoped,
            boolean objectScoped,
            String notes
    ) {
        return new RoutePolicy(null, pathPattern, RoutePolicyType.PROTECTED, roles, permissions, tenantScoped, schoolScoped, objectScoped, notes);
    }

    private Set<String> roles(String... roles) {
        return Set.of(roles);
    }

    private Set<String> permissions(String... permissions) {
        return Set.of(permissions);
    }

    private int matchScore(RoutePolicy policy, String path) {
        if (policy.pathPattern().equals(path)) {
            return Integer.MAX_VALUE;
        }
        return policy.pathPattern().length();
    }
}
