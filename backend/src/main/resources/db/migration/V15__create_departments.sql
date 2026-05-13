-- V15: Departments
-- A department groups staff/teachers under a shared academic or administrative
-- umbrella (e.g. "Science", "Arts & Humanities", "Physical Education").
--
-- Rules:
--   • Department name is unique within a school.
--   • Soft-disable via is_active instead of deleting — historical staff
--     assignments and timetable records reference this ID.

CREATE TABLE departments (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    school_id   UUID        NOT NULL REFERENCES schools(id),
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20),                    -- Optional short code, e.g. "SCI", "HUM"
    description VARCHAR(500),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_departments          PRIMARY KEY (id),
    CONSTRAINT uq_departments_school_name UNIQUE (school_id, name),
    CONSTRAINT uq_departments_school_code UNIQUE (school_id, code)
        DEFERRABLE INITIALLY DEFERRED   -- code is nullable; constraint fires only when code IS NOT NULL
);

-- Partial unique index to enforce code uniqueness only when code is provided.
-- The DEFERRABLE UNIQUE above still applies but this index avoids collisions on
-- NULL values (SQL standard: NULL != NULL, so UNIQUE allows multiple NULLs).
CREATE UNIQUE INDEX uidx_departments_school_code_notnull
    ON departments (school_id, code)
    WHERE code IS NOT NULL;

CREATE INDEX idx_departments_school  ON departments (school_id);
CREATE INDEX idx_departments_tenant  ON departments (tenant_id);
CREATE INDEX idx_departments_active  ON departments (school_id, is_active);
