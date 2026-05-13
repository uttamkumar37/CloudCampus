-- V2: Add updated_at to tenants table.
-- Backfill existing rows with created_at so no NOT NULL violation occurs.
-- Safe on live data: ADD COLUMN with a default is a metadata-only operation in PostgreSQL 11+.

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill historical rows (any rows that existed before this migration).
UPDATE tenants SET updated_at = created_at WHERE updated_at IS NULL;

-- Enforce NOT NULL now that all rows have a value.
ALTER TABLE tenants ALTER COLUMN updated_at SET NOT NULL;

-- Default for future INSERTs that omit the column.
ALTER TABLE tenants ALTER COLUMN updated_at SET DEFAULT NOW();
