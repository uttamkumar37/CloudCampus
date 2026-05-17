-- V61: Add missing foreign-key constraints (H-08 / H-09 / M-12 from audit)
--
-- Each block is idempotent: it checks information_schema before executing the
-- ALTER TABLE, so re-running (e.g. after a failed deployment) is always safe.
-- On-delete behaviour follows the entity lifecycle for each relationship.

-- ─── lesson_plans.tenant_id ──────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_lesson_plans_tenant'
          AND table_name = 'lesson_plans'
    ) THEN
        ALTER TABLE lesson_plans
            ADD CONSTRAINT fk_lesson_plans_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- ─── online_classes.tenant_id ────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_online_classes_tenant'
          AND table_name = 'online_classes'
    ) THEN
        ALTER TABLE online_classes
            ADD CONSTRAINT fk_online_classes_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- ─── video_resources.tenant_id ───────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_video_resources_tenant'
          AND table_name = 'video_resources'
    ) THEN
        ALTER TABLE video_resources
            ADD CONSTRAINT fk_video_resources_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- ─── staff_attendance.tenant_id ──────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_staff_att_tenant'
          AND table_name = 'staff_attendance'
    ) THEN
        ALTER TABLE staff_attendance
            ADD CONSTRAINT fk_staff_att_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- ─── leave_requests.tenant_id ────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_leave_requests_tenant'
          AND table_name = 'leave_requests'
    ) THEN
        ALTER TABLE leave_requests
            ADD CONSTRAINT fk_leave_requests_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- ─── payment_orders.student_id ───────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_payment_orders_student'
          AND table_name = 'payment_orders'
    ) THEN
        ALTER TABLE payment_orders
            ADD CONSTRAINT fk_payment_orders_student
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;
    END IF;
END;
$$;

-- ─── payment_orders.initiated_by ─────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_payment_orders_initiated_by'
          AND table_name = 'payment_orders'
    ) THEN
        ALTER TABLE payment_orders
            ADD CONSTRAINT fk_payment_orders_initiated_by
            FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END;
$$;

-- ─── audit_log.actor_id ──────────────────────────────────────────────────────
-- Noted in V4 as "FK added when users table exists".
-- ON DELETE SET NULL preserves audit history when users are soft-deleted.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_audit_log_actor'
          AND table_name = 'audit_log'
    ) THEN
        ALTER TABLE audit_log
            ADD CONSTRAINT fk_audit_log_actor
            FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END;
$$;

-- ─── device_tokens.user_id ───────────────────────────────────────────────────
-- Cascade delete: device tokens are useless once the user account is removed.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_device_tokens_user'
          AND table_name = 'device_tokens'
    ) THEN
        ALTER TABLE device_tokens
            ADD CONSTRAINT fk_device_tokens_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END;
$$;
