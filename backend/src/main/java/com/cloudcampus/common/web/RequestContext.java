package com.cloudcampus.common.web;

import org.slf4j.MDC;

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

    public static final String MDC_TENANT_ID = "tenantId";
    public static final String MDC_SCHOOL_ID = "schoolId";
    public static final String MDC_USER_ID   = "userId";

    private RequestContext() {
    }

    public static void setTenantId(String tenantId) {
        setOrClear(TENANT_ID, MDC_TENANT_ID, tenantId);
    }
    public static String getTenantId()              { return TENANT_ID.get(); }
    public static void clearTenantId() {
        TENANT_ID.remove();
        MDC.remove(MDC_TENANT_ID);
    }

    public static void setSchoolId(String schoolId) {
        setOrClear(SCHOOL_ID, MDC_SCHOOL_ID, schoolId);
    }
    public static String getSchoolId()              { return SCHOOL_ID.get(); }
    public static void clearSchoolId() {
        SCHOOL_ID.remove();
        MDC.remove(MDC_SCHOOL_ID);
    }

    public static void setUserId(UUID userId) {
        if (userId == null) {
            clearUserId();
            return;
        }
        USER_ID.set(userId);
        MDC.put(MDC_USER_ID, userId.toString());
    }
    public static UUID getUserId()                  { return USER_ID.get(); }
    public static void clearUserId() {
        USER_ID.remove();
        MDC.remove(MDC_USER_ID);
    }

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

    private static void setOrClear(ThreadLocal<String> holder, String mdcKey, String value) {
        if (value == null || value.isBlank()) {
            holder.remove();
            MDC.remove(mdcKey);
            return;
        }
        holder.set(value);
        MDC.put(mdcKey, value);
    }
}
