package com.cloudcampus.common.web;

import java.time.Instant;
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

    private static final ThreadLocal<String>  TENANT_ID  = new ThreadLocal<>();
    private static final ThreadLocal<String>  SCHOOL_ID  = new ThreadLocal<>();
    private static final ThreadLocal<UUID>    USER_ID    = new ThreadLocal<>();
    // H-02: access token jti + expiry — set by JwtAuthenticationFilter for logout denylist
    private static final ThreadLocal<String>  JWT_JTI    = new ThreadLocal<>();
    private static final ThreadLocal<Instant> JWT_EXPIRY = new ThreadLocal<>();

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

    public static void setJwtJti(String jti)        { JWT_JTI.set(jti); }
    public static String getJwtJti()                { return JWT_JTI.get(); }

    public static void setJwtExpiry(Instant expiry) { JWT_EXPIRY.set(expiry); }
    public static Instant getJwtExpiry()            { return JWT_EXPIRY.get(); }

    public static void clearAll() {
        clearTenantId();
        clearSchoolId();
        clearUserId();
        JWT_JTI.remove();
        JWT_EXPIRY.remove();
    }
}

