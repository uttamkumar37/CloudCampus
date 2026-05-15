-- V41: Tenant configuration engine (CC-0207)
--
-- Stores per-tenant key-value configuration settings.
-- Keys are validated at the application layer against TenantConfigKey enum.
-- Missing rows fall back to the per-key default defined in the enum.
--
-- Design: composite PK avoids a surrogate key; config_value is VARCHAR(500)
-- which handles all current use cases (emails, timezones, small integers).

CREATE TABLE IF NOT EXISTS tenant_configs (
    tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_key   VARCHAR(100) NOT NULL,
    config_value VARCHAR(500) NOT NULL,
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tenant_id, config_key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant_id ON tenant_configs(tenant_id);
