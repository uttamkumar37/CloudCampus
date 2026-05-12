-- V4: Platform audit log — append-only, immutable record of all significant events.
--
-- Design principles:
--   NEVER UPDATE or DELETE rows in this table.
--   Retention policy: enforced by a background archival job (CC-1802).
--   tenant_id is nullable — Super Admin actions have no tenant context.
--   actor_id is nullable — system-generated events (bootstrap, scheduled jobs) have no actor.
--
-- Event categories (audit_category):
--   AUTH       — login, logout, token refresh, failed login, lockout
--   TENANT     — tenant created, suspended, archived
--   PERMISSION — role assigned, permission changed
--   FINANCE    — fee paid, payment reversed, invoice generated
--   CONFIG     — feature enabled/disabled, subscription changed
--   SECURITY   — password changed, MFA enrolled, suspicious access
--   DATA       — bulk import, export, student created, deleted
--   SYSTEM     — bootstrap, scheduled job, migration

CREATE TABLE IF NOT EXISTS audit_log (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID        REFERENCES tenants(id),
    actor_id       UUID,           -- user_id of who performed the action (FK added when users table exists)
    actor_username VARCHAR(200),   -- denormalised for readability (user may be deleted later)
    category       VARCHAR(20)  NOT NULL,
    event_type     VARCHAR(100) NOT NULL,
    resource_type  VARCHAR(100),
    resource_id    VARCHAR(200),
    description    TEXT,
    metadata       JSONB,           -- arbitrary structured context (before/after values, IP, device)
    ip_address     INET,
    user_agent     TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Queries are always scoped to a tenant + time range for the tenant audit view.
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_created ON audit_log(tenant_id, created_at DESC);
-- Super Admin cross-tenant queries.
CREATE INDEX IF NOT EXISTS idx_audit_log_created       ON audit_log(created_at DESC);
-- Resource-level drill-down (e.g. "all events for student X").
CREATE INDEX IF NOT EXISTS idx_audit_log_resource      ON audit_log(resource_type, resource_id);
-- Actor-level drill-down (e.g. "all actions by user Y").
CREATE INDEX IF NOT EXISTS idx_audit_log_actor         ON audit_log(actor_id, created_at DESC);
