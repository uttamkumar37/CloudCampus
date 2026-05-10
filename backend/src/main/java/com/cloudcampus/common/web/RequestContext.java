package com.cloudcampus.common.web;

public final class RequestContext {
    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> SCHOOL_ID = new ThreadLocal<>();

    private RequestContext() {
    }

    public static void setTenantId(String tenantId) {
        TENANT_ID.set(tenantId);
    }

    public static String getTenantId() {
        return TENANT_ID.get();
    }

    public static void clearTenantId() {
        TENANT_ID.remove();
    }

    public static void setSchoolId(String schoolId) {
        SCHOOL_ID.set(schoolId);
    }

    public static String getSchoolId() {
        return SCHOOL_ID.get();
    }

    public static void clearSchoolId() {
        SCHOOL_ID.remove();
    }

    public static void clearAll() {
        clearTenantId();
        clearSchoolId();
    }
}

