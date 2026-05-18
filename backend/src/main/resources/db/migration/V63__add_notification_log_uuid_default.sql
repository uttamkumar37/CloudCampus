-- V63: M-04 — add DEFAULT gen_random_uuid() to notification_logs.id
--
-- The original V25 migration defined id as UUID PRIMARY KEY without a DEFAULT.
-- Any INSERT that omits the id column (e.g. bulk log writes that rely on
-- the DB to generate the PK) will fail with "null value in column id".
-- gen_random_uuid() is available as a built-in function from PostgreSQL 13+.

ALTER TABLE notification_logs
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
