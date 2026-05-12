-- V9: Soft delete strategy — adds deleted_at to the users table (EUP-012 / B6).
--
-- Design principles:
--   1. NEVER physically delete user rows. Regulatory requirements (GDPR Article 17
--      right-to-erasure excluded for legitimate interest — education records) and
--      audit log FK integrity require row retention.
--   2. deleted_at NULL  → active record (all application queries see this row).
--      deleted_at NOT NULL → soft-deleted (invisible to application, retained for audits).
--   3. Hibernate @SQLRestriction("deleted_at IS NULL") on the entity ensures every
--      JPA/JPQL query automatically filters out deleted rows without any caller change.
--   4. Hibernate @SQLDelete rewrites repository.delete() to an UPDATE — never issues DELETE.
--
-- Index strategy:
--   V8 created non-partial composite indexes on users(tenant_id, role/status/username).
--   Now that deleted_at exists, we replace those with partial indexes so that index scans
--   never visit soft-deleted rows (they are the rare case, not the common path).

-- ── Add soft-delete column ────────────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ── Replace V8 non-partial user indexes with partial versions ─────────────────

-- Drop old non-partial indexes created in V8.
-- The CREATE below will re-add them as partial indexes scoped to active rows.
DROP INDEX IF EXISTS idx_users_tenant_role;
DROP INDEX IF EXISTS idx_users_tenant_status;
DROP INDEX IF EXISTS idx_users_tenant_username;

-- Partial replacement — only indexes active (not soft-deleted) users.
-- All standard user list queries filter deleted_at IS NULL, so these cover ~100% of queries.
CREATE INDEX IF NOT EXISTS idx_users_tenant_role
    ON users(tenant_id, role)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_tenant_status
    ON users(tenant_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_tenant_username
    ON users(tenant_id, username)
    WHERE deleted_at IS NULL;
