package com.cloudcampus.tenant.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class HeaderTenantResolver implements TenantResolver {
    public static final String TENANT_HEADER = "X-Tenant-Id";
    public static final String SCHOOL_HEADER = "X-School-Id";

    @Override
    public Optional<String> resolveTenantId(HttpServletRequest request) {
        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId == null || tenantId.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(tenantId.trim());
    }

    @Override
    public Optional<String> resolveSchoolId(HttpServletRequest request) {
        String schoolId = request.getHeader(SCHOOL_HEADER);
        if (schoolId == null || schoolId.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(schoolId.trim());
    }
}

