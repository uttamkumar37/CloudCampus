package com.cloudcampus.common.exception;

/**
 * Thrown when a request arrives for a tenant that is SUSPENDED or ARCHIVED.
 * Mapped to HTTP 403 with code TENANT_SUSPENDED by RestExceptionHandler.
 */
public class TenantSuspendedException extends RuntimeException {
    private final String tenantId;

    public TenantSuspendedException(String tenantId) {
        super("Tenant is not active: " + tenantId);
        this.tenantId = tenantId;
    }

    public String getTenantId() {
        return tenantId;
    }
}
