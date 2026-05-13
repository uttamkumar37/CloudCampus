package com.cloudcampus.common.tenant;

/**
 * Constants for the Hibernate tenant isolation filter (CC-0203 / EUP-005).
 *
 * Usage:
 *   1. Annotate every multi-tenant entity with:
 *        @FilterDef(name = TenantFilter.NAME,
 *                   parameters = @ParamDef(name = TenantFilter.PARAM, type = String.class))
 *        @Filter(name = TenantFilter.NAME, condition = "tenant_id = :" + TenantFilter.PARAM)
 *
 *   2. TenantFilterAspect enables the filter automatically before any JPA repository method.
 *
 *   3. Entities that are NOT tenant-scoped (e.g. Tenant itself, Feature catalog) must NOT
 *      carry these annotations.
 */
public final class TenantFilter {

    /** Hibernate filter name — must match @FilterDef.name and @Filter.name on every entity. */
    public static final String NAME  = "tenantFilter";

    /** Filter parameter name — bound to RequestContext.getTenantId() at query time. */
    public static final String PARAM = "tenantId";

    /** SQL condition applied as a WHERE clause fragment. */
    public static final String CONDITION = "tenant_id = :tenantId";

    private TenantFilter() {}
}
