-- V13: Sections — a division of a class (e.g. Class 5 / Section A, B, C).
--
-- Design decisions:
--   A section belongs to exactly one class (and therefore one academic year).
--   capacity: the maximum number of students allowed. Checked at admission time.
--   name: typically a single letter "A", "B", "C" or "Red", "Blue", etc.
--
--   section name is unique within a class (uq_sections_class_name).

CREATE TABLE IF NOT EXISTS sections (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID         NOT NULL REFERENCES tenants(id),
    school_id   UUID         NOT NULL REFERENCES schools(id),
    class_id    UUID         NOT NULL REFERENCES classes(id),
    name        VARCHAR(50)  NOT NULL,       -- e.g. "A", "B", "Red"
    capacity    SMALLINT     NOT NULL DEFAULT 40,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_sections_class_name  UNIQUE (class_id, name),
    CONSTRAINT chk_sections_capacity   CHECK  (capacity > 0 AND capacity <= 200)
);

CREATE INDEX IF NOT EXISTS idx_sections_class    ON sections(class_id);
CREATE INDEX IF NOT EXISTS idx_sections_school   ON sections(school_id);
CREATE INDEX IF NOT EXISTS idx_sections_tenant   ON sections(tenant_id);
