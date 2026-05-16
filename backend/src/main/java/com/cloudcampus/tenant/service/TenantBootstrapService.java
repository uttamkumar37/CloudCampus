package com.cloudcampus.tenant.service;

import java.util.UUID;

/**
 * Seeds a new tenant's default school with data every school needs out-of-the-box:
 * current academic year, standard departments, and common fee categories (CC-0211).
 *
 * Called once from {@link TenantServiceImpl#create} immediately after the default
 * school and school settings are persisted.  All seed operations are idempotent —
 * the service checks for existing records before inserting, so re-running against
 * an already-bootstrapped school is safe.
 */
public interface TenantBootstrapService {

    void bootstrap(UUID tenantId, UUID schoolId);
}
