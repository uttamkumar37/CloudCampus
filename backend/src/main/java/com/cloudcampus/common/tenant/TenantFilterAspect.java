package com.cloudcampus.common.tenant;

import com.cloudcampus.common.web.RequestContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Hibernate tenant isolation aspect (CC-0203 / EUP-005).
 *
 * Automatically enables the "tenantFilter" Hibernate filter before every JPA
 * repository method execution, binding the current request's tenantId.
 *
 * HOW IT WORKS
 * ────────────
 * Spring Data JPA delegates to a Hibernate Session per request.
 * Hibernate @Filter annotations add a SQL WHERE clause fragment to every query
 * on the annotated entity — but only if the filter is explicitly enabled on the
 * current Session with the correct parameter value.
 *
 * This aspect intercepts every Spring Data JpaRepository method call and enables
 * the filter transparently, so no repository or service code needs to call
 * session.enableFilter() manually.
 *
 * WHEN THE FILTER IS NOT APPLIED
 * ──────────────────────────────
 * If RequestContext.getTenantId() is null (e.g. during bootstrap, system jobs,
 * or Super Admin cross-tenant operations), the filter is deliberately NOT enabled.
 * This means:
 *   - System/startup code can read across all tenants.
 *   - Super Admin endpoints MUST explicitly scope their queries or use
 *     a separate repository method that does not rely on this filter.
 *   - Background jobs MUST set RequestContext.tenantId before calling
 *     tenant-scoped repositories.
 *
 * SUPER ADMIN NOTE
 * ─────────────────
 * Super Admin requests arrive with no tenant header (tenantId is null in
 * RequestContext). The filter is therefore OFF for Super Admin calls — they
 * see all rows. This is intentional and correct. Tenant-scoped controllers
 * must NOT be called by Super Admin paths (enforced by RBAC in SecurityConfig).
 *
 * IMPORTANT: @Filter does NOT protect native queries or JPQL with explicit
 * cross-entity joins. Use it as a defence-in-depth layer, not the sole guard.
 */
@Aspect
@Component
public class TenantFilterAspect {

    private static final Logger log = LoggerFactory.getLogger(TenantFilterAspect.class);

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Intercepts all public methods on Spring Data JPA repository implementations
     * (SimpleJpaRepository and custom repository beans) and enables the tenant filter
     * when a tenant context is present.
     *
     * Pointcut breakdown:
     *   execution(* org.springframework.data.jpa.repository.JpaRepository+.*(..))
     *   — matches all methods on any class that implements JpaRepository (including
     *     generated Spring Data proxy classes that extend SimpleJpaRepository).
     */
    @Before("execution(* org.springframework.data.jpa.repository.JpaRepository+.*(..))")
    public void enableTenantFilter() {
        String tenantId = RequestContext.getTenantId();

        if (tenantId == null) {
            // No tenant context: Super Admin, bootstrap, or system job.
            // Filter is OFF — caller sees all rows across all tenants.
            // This is intentional — do not log at WARN (it fires on every Super Admin call).
            log.trace("TenantFilterAspect: tenantId is null — skipping filter (Super Admin or system context)");
            return;
        }

        try {
            UUID tenantUUID = UUID.fromString(tenantId);
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter(TenantFilter.NAME)
                   .setParameter(TenantFilter.PARAM, tenantUUID);
        } catch (IllegalArgumentException ex) {
            log.warn("TenantFilterAspect: tenantId '{}' is not a valid UUID — skipping filter", tenantId);
        } catch (Exception ex) {
            // If the entity being queried doesn't have @FilterDef (e.g. Tenant, Feature),
            // Hibernate silently ignores the enableFilter call. However, if something
            // genuinely goes wrong (e.g. wrong parameter name), we log at WARN.
            log.warn("TenantFilterAspect: failed to enable filter for tenantId={}: {}",
                    tenantId, ex.getMessage());
        }
    }
}
