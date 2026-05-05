DO $$
DECLARE
    schema_name text;
BEGIN
    FOR schema_name IN
        SELECT nspname
        FROM pg_namespace
        WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
          AND nspname NOT LIKE 'pg_temp_%'
          AND nspname NOT LIKE 'pg_toast_temp_%'
          AND EXISTS (
              SELECT 1
              FROM information_schema.tables t
              WHERE t.table_schema = nspname
                AND t.table_name = 'users'
          )
    LOOP
        EXECUTE format('ALTER TABLE %I.users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)', schema_name);
        EXECUTE format('ALTER TABLE %I.users ADD COLUMN IF NOT EXISTS first_login_required BOOLEAN NOT NULL DEFAULT FALSE', schema_name);

        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I.otps (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL,
                channel VARCHAR(10) NOT NULL,
                purpose VARCHAR(40) NOT NULL,
                destination VARCHAR(160) NOT NULL,
                otp_hash VARCHAR(200) NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                verify_attempts INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ,
                created_by UUID,
                updated_by UUID
            )',
            schema_name
        );
    END LOOP;
END $$;
