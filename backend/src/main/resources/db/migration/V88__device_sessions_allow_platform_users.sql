-- Allow tenantless platform users, such as SUPER_ADMIN, to have visible active-device sessions.
ALTER TABLE device_sessions
    ALTER COLUMN tenant_id DROP NOT NULL;
