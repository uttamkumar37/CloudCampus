-- V64: M-14 — add tenant_id to device_tokens for proper tenant isolation
--
-- The original V10 table had no tenant_id, so queries by userId alone could
-- theoretically return tokens across tenants if a userId were ever reused or
-- compromised. Adding tenant_id allows the TenantFilterAspect and explicit
-- service-layer scoping to prevent cross-tenant token access.
--
-- Existing rows get NULL tenant_id initially; the application sets it on the
-- next registerToken() call (upsert path). The column is NOT NULL after
-- the backfill is safe — left nullable here to avoid breaking running instances
-- that have existing rows (additive, rollback-safe migration).

ALTER TABLE device_tokens
    ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Index: tenant-scoped lookup (push notification dispatch per tenant)
CREATE INDEX idx_device_tokens_tenant ON device_tokens(tenant_id);

-- Index: tenant + user — the most common query pattern (find all tokens for
-- a given user scoped to their tenant)
CREATE INDEX idx_device_tokens_tenant_user ON device_tokens(tenant_id, user_id);
