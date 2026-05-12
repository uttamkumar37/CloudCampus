-- V5: User table — authentication foundation (CC-0101).
--
-- Design decisions:
--   tenant_id is NULL for SUPER_ADMIN users (platform-level, no tenant context).
--   username is globally unique (enforced at DB level; email used as username).
--   password_hash stores BCrypt output (prefix $2a$12$...).
--   status: ACTIVE | SUSPENDED | PENDING_PASSWORD_CHANGE
--   role: application-level enum validated by Spring Security.
--
-- IMPORTANT: This table stores credentials. Access must be restricted to the auth service only.
-- Never expose password_hash in any API response.

CREATE TABLE IF NOT EXISTS users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NULL for SUPER_ADMIN; non-null for all tenant-scoped roles.
    tenant_id       UUID         REFERENCES tenants(id) ON DELETE CASCADE,
    username        VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(200) NOT NULL,
    role            VARCHAR(50)  NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    -- Force password change on first login (bootstrap accounts, bulk-created accounts).
    force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tenant-scoped user listing.
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
-- Login lookup — must be fast.
CREATE INDEX IF NOT EXISTS idx_users_username  ON users(username);
-- Role-based queries from Super Admin dashboard.
CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);
-- Status filter (e.g. list all SUSPENDED users).
CREATE INDEX IF NOT EXISTS idx_users_status    ON users(status);
