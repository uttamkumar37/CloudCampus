-- L-13: Add soft-delete column to key content tables so teachers / admins can
-- recover accidentally deleted records. The column is nullable (NULL = active,
-- NOT NULL = soft-deleted). Hibernate @SQLRestriction("deleted_at IS NULL") on
-- the entity ensures normal queries never surface soft-deleted rows.
--
-- Partial indexes exclude soft-deleted rows from the main lookup paths, keeping
-- query performance identical to before.

ALTER TABLE lesson_plans        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE online_classes      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE video_resources     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE homework_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE school_notices       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial indexes so active-row scans stay efficient
CREATE INDEX IF NOT EXISTS idx_lesson_plans_active
    ON lesson_plans (school_id, academic_year_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_online_classes_active
    ON online_classes (school_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_video_resources_active
    ON video_resources (school_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_homework_assignments_active
    ON homework_assignments (school_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_school_notices_active
    ON school_notices (school_id) WHERE deleted_at IS NULL;
