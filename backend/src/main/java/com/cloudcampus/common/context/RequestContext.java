package com.cloudcampus.common.context;

import java.util.Set;
import java.util.UUID;

public record RequestContext(
        UUID userId,
        UUID tenantId,
        UUID activeSchoolId,
        Set<String> roles,
        Set<String> permissions,
        String correlationId,
        String requestSource,
        boolean superAdmin
) {
    public RequestContext {
        roles = roles == null ? Set.of() : Set.copyOf(roles);
        permissions = permissions == null ? Set.of() : Set.copyOf(permissions);
    }

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }

    public boolean hasPermission(String permission) {
        return permissions != null && permissions.contains(permission);
    }

    public boolean hasActiveSchool() {
        return activeSchoolId != null;
    }

    public boolean isSchoolScopedTo(UUID schoolId) {
        return activeSchoolId != null && activeSchoolId.equals(schoolId);
    }

    public boolean isTenantScopedTo(UUID tenantId) {
        return this.tenantId != null && this.tenantId.equals(tenantId);
    }
}
