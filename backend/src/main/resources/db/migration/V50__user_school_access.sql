-- V50: user_school_access — cross-school access model (CC-0214).
-- Grants a user explicit access to one or more schools within the same tenant.
-- One row per (user, school) pair. is_primary = true marks the school that is
-- returned in the JWT on login; only one primary per user is enforced by the app.

CREATE TABLE IF NOT EXISTS user_school_access (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    school_id         UUID        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    tenant_id         UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_primary        BOOLEAN     NOT NULL DEFAULT false,
    granted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by_user_id UUID       REFERENCES users(id)
);

-- Each user can have at most one grant per school.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_user_school_access
    ON user_school_access (user_id, school_id);

CREATE INDEX IF NOT EXISTS idx_user_school_access_user
    ON user_school_access (user_id);

CREATE INDEX IF NOT EXISTS idx_user_school_access_school
    ON user_school_access (school_id);
