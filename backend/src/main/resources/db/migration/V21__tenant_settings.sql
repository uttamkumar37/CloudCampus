CREATE TABLE tenant_settings (
    tenant_id VARCHAR(36) PRIMARY KEY,
    display_name VARCHAR(180) NOT NULL,
    billing_email VARCHAR(320),
    support_email VARCHAR(320),
    timezone VARCHAR(80) NOT NULL,
    locale VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tenant_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
