-- V32: Homework assignments — CC-0702 Homework management.
--
-- Design decisions:
--   One row = one homework assignment given to a class+section for a subject.
--   section_id is nullable — if NULL, the homework applies to the entire class.
--   status : DRAFT (saved not published) | PUBLISHED | CLOSED (past due_date, no new submissions).
--   Attachments (file URLs) stored as a JSON text array in attachment_urls.
--   Tenant isolation applied at service layer via Hibernate @Filter (tenant_id).

CREATE TABLE IF NOT EXISTS homework_assignments (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID        NOT NULL REFERENCES tenants(id),
    school_id        UUID        NOT NULL REFERENCES schools(id),
    academic_year_id UUID        NOT NULL REFERENCES academic_years(id),
    class_id         UUID        NOT NULL REFERENCES classes(id),
    section_id       UUID        REFERENCES sections(id),
    subject_id       UUID        NOT NULL REFERENCES subjects(id),
    assigned_by      UUID        REFERENCES staff(id),
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    due_date         DATE        NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','CLOSED')),
    attachment_urls  TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homework_tenant       ON homework_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_homework_school_year  ON homework_assignments(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_homework_class_sec    ON homework_assignments(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date     ON homework_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_assigned_by  ON homework_assignments(assigned_by);
