-- V49: device_sessions — tracks authenticated devices per user.
-- Populated on login; users can list and revoke individual sessions.

CREATE TABLE IF NOT EXISTS device_sessions (
    id              UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID                     NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    device_name     VARCHAR(255)             NOT NULL,
    ip_address      VARCHAR(45)              NOT NULL,
    user_agent      VARCHAR(512)             NOT NULL,
    last_seen_at    TIMESTAMPTZ              NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ              NOT NULL DEFAULT now(),
    revoked         BOOLEAN                  NOT NULL DEFAULT false,
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_device_sessions_user
    ON device_sessions (user_id, revoked);

CREATE INDEX IF NOT EXISTS idx_device_sessions_tenant
    ON device_sessions (tenant_id);
