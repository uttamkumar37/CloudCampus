package com.cloudcampus.common.web;

import java.util.UUID;

/**
 * Holds per-request contextual values propagated by filters.
 *
 * ThreadLocal usage note (C-18): This is safe for platform threads (Tomcat default).
 * When migrating to Virtual Threads (Java 21 + server.tomcat.use-virtual-threads=true),
 * replace with ScopedValue or Spring Security's SecurityContextHolder with
 * MODE_INHERITABLETHREADLOCAL. Track this migration in CC-0011.
 */
public final class RequestContext {

    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> SCHOOL_ID = new ThreadLocal<>();
    // C-18: userId — populated by JWT auth filter (CC-0102) once auth is in place.
    private static final ThreadLocal<UUID>   USER_ID   = new ThreadLocal<>();

    private RequestContext() {
    }

    public static void setTenantId(String tenantId) { TENANT_ID.set(tenantId); }
    public static String getTenantId()              { return TENANT_ID.get(); }
    public static void clearTenantId()              { TENANT_ID.remove(); }

    public static void setSchoolId(String schoolId) { SCHOOL_ID.set(schoolId); }
    public static String getSchoolId()              { return SCHOOL_ID.get(); }
    public static void clearSchoolId()              { SCHOOL_ID.remove(); }

    public static void setUserId(UUID userId)       { USER_ID.set(userId); }
    public static UUID getUserId()                  { return USER_ID.get(); }
    public static void clearUserId()                { USER_ID.remove(); }

    public static void clearAll() {
        clearTenantId();
        clearSchoolId();
        clearUserId();
    }
}

