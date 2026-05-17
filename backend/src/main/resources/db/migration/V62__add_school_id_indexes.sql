-- V62: Add missing school_id composite indexes on content tables (H-10)
--
-- lesson_plans, online_classes, and video_resources were created without
-- school_id + date/time indexes. Queries filtering by school (the most common
-- access pattern for teacher dashboards) result in full-table scans once
-- row counts grow beyond a few thousand per tenant.
--
-- All indexes use IF NOT EXISTS so this migration is safe to re-run.

CREATE INDEX IF NOT EXISTS idx_lesson_plans_school_date
    ON lesson_plans (school_id, plan_date DESC);

CREATE INDEX IF NOT EXISTS idx_online_classes_school_scheduled
    ON online_classes (school_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_resources_school_created
    ON video_resources (school_id, created_at DESC);
