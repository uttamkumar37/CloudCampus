-- V14: Subjects — academic subjects taught at a school.
--
-- Design decisions:
--   Subjects are school-scoped, NOT academic-year-scoped.
--   The same "Mathematics" subject exists across all years — only the timetable
--   (Phase 8) links subjects to specific classes/sections per year.
--
--   code: short identifier used in reports and imports (e.g. "MATH", "ENG", "SCI").
--         Unique within a school.
--
--   is_active: soft-disable subjects no longer taught without deleting them.
--              Deleting a subject would break historical timetable/result records.

CREATE TABLE IF NOT EXISTS subjects (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID         NOT NULL REFERENCES tenants(id),
    school_id   UUID         NOT NULL REFERENCES schools(id),
    name        VARCHAR(200) NOT NULL,       -- e.g. "Mathematics", "English"
    code        VARCHAR(30)  NOT NULL,       -- e.g. "MATH", "ENG"
    description VARCHAR(500),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_subjects_school_code UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_school  ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_tenant  ON subjects(tenant_id);
-- Fast lookup of active subjects (most queries filter by is_active = TRUE).
CREATE INDEX IF NOT EXISTS idx_subjects_active  ON subjects(school_id, is_active);
