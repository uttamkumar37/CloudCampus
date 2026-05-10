package com.cloudcampus.tenant.web;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

public interface TenantResolver {
    Optional<String> resolveTenantId(HttpServletRequest request);

    Optional<String> resolveSchoolId(HttpServletRequest request);
}

