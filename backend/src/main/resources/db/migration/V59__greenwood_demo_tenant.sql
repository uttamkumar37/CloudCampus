-- V59: Jawahar Navodaya Vidyalaya Lucknow — Enterprise Demo Tenant Foundation
--
-- Creates the tenant + school rows so the Java DemoDataSeeder (ApplicationRunner)
-- can guard-check on startup and populate all bulk data.
--
-- Bulk seeding (1000+ students, 40 teachers, attendance, exams, etc.) is handled
-- by com.cloudcampus.demo.DemoDataSeeder which runs when app.demo.enabled=true.
--
-- Idempotent: all INSERTs use ON CONFLICT … DO NOTHING.
-- UUIDs use prefix c000000x-… (all valid hex: c, 0).

DO $v59$
BEGIN

    -- 1. Tenant row
    INSERT INTO tenants (id, code, name, status, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000001',
            'jnv-lucknow-demo',
            'Jawahar Navodaya Vidyalaya Lucknow',
            'ACTIVE',
            NOW())
    ON CONFLICT (code) DO NOTHING;

    -- 2. School row
    INSERT INTO schools (id, tenant_id, code, name, address, phone, email, status)
    VALUES ('c0000000-0000-0000-0000-000000000002',
            'c0000000-0000-0000-0000-000000000001',
            'MAIN',
            'Jawahar Navodaya Vidyalaya Lucknow',
            'Sector 15, Indira Nagar, Lucknow, Uttar Pradesh - 226016',
            '+917905025730',
            'uttamkumar3797@gmail.com',
            'ACTIVE')
    ON CONFLICT ON CONSTRAINT uq_schools_tenant_code DO NOTHING;

    -- 3. Enterprise subscription (all features ON)
    INSERT INTO tenant_features (tenant_id, feature_key, enabled)
    SELECT 'c0000000-0000-0000-0000-000000000001', key, true
    FROM   features
    ON CONFLICT (tenant_id, feature_key) DO UPDATE SET enabled = true;

    RAISE NOTICE 'V59: JNV Lucknow demo tenant foundation ready.';

END $v59$;
