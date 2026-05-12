-- V12: Classes — a grade/standard within a school for a given academic year.
--
-- Design decisions:
--   "Class" is the grade level (e.g. "Grade 5", "Class 10A").
--   Sections hang off a class (e.g. "Grade 5 / Section A").
--   Classes are scoped to an academic year so the same grade can be recreated
--   each year without overwriting historical data.
--
--   name + academic_year_id is unique per school (uq_classes_school_year_name).
--
--   grade_order: integer used to sort classes numerically in UI (e.g. 1=Grade1, 10=Grade10).
--   display_name: overrides the name in UI if set (e.g. "Nursery" vs grade_order=0).

CREATE TABLE IF NOT EXISTS classes (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID         NOT NULL REFERENCES tenants(id),
    school_id        UUID         NOT NULL REFERENCES schools(id),
    academic_year_id UUID         NOT NULL REFERENCES academic_years(id),
    name             VARCHAR(100) NOT NULL,       -- e.g. "Grade 5", "Class 10"
    display_name     VARCHAR(100),                -- optional override for UI
    grade_order      SMALLINT     NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_classes_school_year_name UNIQUE (school_id, academic_year_id, name)
);

CREATE INDEX IF NOT EXISTS idx_classes_school        ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_tenant        ON classes(tenant_id);
