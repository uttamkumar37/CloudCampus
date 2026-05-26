CREATE TABLE tenant_school_limits (
    tenant_id VARCHAR(36) PRIMARY KEY,
    max_schools INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tenant_school_limits_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT chk_tenant_school_limits_max_schools CHECK (max_schools >= 1)
);
