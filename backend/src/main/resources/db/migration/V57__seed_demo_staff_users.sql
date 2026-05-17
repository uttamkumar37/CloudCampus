-- V57: Link demo teacher/school-admin users to staff records for local dev.
--
-- The V42 seed guard skips when the tenant was bootstrapped via API (random UUIDs).
-- This migration is idempotent and creates minimal staff rows so the teacher
-- portal (lesson plans, online classes, videos) can resolve a staffId.

DO $v57$
DECLARE
    v_teacher_user_id  UUID;
    v_admin_user_id    UUID;
    v_tenant_id        UUID;
    v_school_id        UUID;
BEGIN
    -- Resolve the jnv-lucknow tenant and school
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'jnv-lucknow' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'V57: jnv-lucknow tenant not found — skipping.';
        RETURN;
    END IF;

    SELECT id INTO v_school_id FROM schools WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_school_id IS NULL THEN
        RAISE NOTICE 'V57: no school found for jnv-lucknow — skipping.';
        RETURN;
    END IF;

    -- Link teacher1
    SELECT id INTO v_teacher_user_id FROM users WHERE username = 'teacher1' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_teacher_user_id IS NOT NULL THEN
        INSERT INTO staff (tenant_id, school_id, user_id, employee_number, staff_type, first_name, last_name, joining_date)
        VALUES (v_tenant_id, v_school_id, v_teacher_user_id, 'EMP-DEMO-001', 'TEACHER', 'Demo', 'Teacher', CURRENT_DATE)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Link schooladmin user if present and not already a staff record
    SELECT id INTO v_admin_user_id FROM users WHERE username = 'schooladmin' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_admin_user_id IS NOT NULL THEN
        INSERT INTO staff (tenant_id, school_id, user_id, employee_number, staff_type, first_name, last_name, joining_date)
        VALUES (v_tenant_id, v_school_id, v_admin_user_id, 'EMP-DEMO-002', 'ADMIN_STAFF', 'School', 'Admin', CURRENT_DATE)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Grant schooladmin user_school_access so school_id appears in the JWT
    IF v_admin_user_id IS NOT NULL THEN
        INSERT INTO user_school_access (user_id, school_id, tenant_id, is_primary)
        VALUES (v_admin_user_id, v_school_id, v_tenant_id, true)
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'V57: demo staff-user links applied for tenant %', v_tenant_id;
END $v57$;
