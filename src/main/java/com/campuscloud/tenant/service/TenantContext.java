package com.campuscloud.tenant.service;

import org.springframework.util.StringUtils;

public final class TenantContext {

    public static final String DEFAULT_SCHEMA = "public";

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenant(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static String getTenant() {
        String tenant = CURRENT_TENANT.get();
        return StringUtils.hasText(tenant) ? tenant : DEFAULT_SCHEMA;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
