-- V18: Student-Parent mapping table (CC-0506).
--
-- Design decisions:
--   A student can have multiple parent/guardian entries (e.g. mother + father).
--   parent_user_id must reference an existing user (with role PARENT).
--     The application enforces the PARENT role check; the DB only holds the FK.
--   relationship captures the family connection ('FATHER','MOTHER','GUARDIAN',…).
--   is_primary flags the single preferred contact; enforced as a partial unique
--     index so only one primary link can exist per student at a time.
--   ON DELETE CASCADE on student_id — removing a student removes their links.
--   ON DELETE CASCADE on parent_user_id — removing a user removes their links.
--   tenant_id is denormalised for Hibernate tenant filter support.

CREATE TABLE IF NOT EXISTS student_parent_links (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    student_id      UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_user_id  UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    relationship    VARCHAR(30) NOT NULL DEFAULT 'GUARDIAN',
    is_primary      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_parent_link
        UNIQUE (student_id, parent_user_id),
    CONSTRAINT chk_spl_relationship
        CHECK (relationship IN ('FATHER', 'MOTHER', 'GUARDIAN', 'SIBLING', 'OTHER'))
);

-- Enforce at most one primary contact per student.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_spl_primary_per_student
    ON student_parent_links(student_id)
    WHERE is_primary = TRUE;

-- List all parents for a student (primary use-case).
CREATE INDEX IF NOT EXISTS idx_spl_student  ON student_parent_links(student_id);
-- List all students linked to a parent (parent portal use-case).
CREATE INDEX IF NOT EXISTS idx_spl_parent   ON student_parent_links(parent_user_id);
-- Tenant-scoped queries.
CREATE INDEX IF NOT EXISTS idx_spl_tenant   ON student_parent_links(tenant_id);
