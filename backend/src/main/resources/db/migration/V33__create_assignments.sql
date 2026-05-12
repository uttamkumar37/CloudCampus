-- V33: Assignment engine — CC-0703 Assignment engine (create + submit + grade).
--
-- Two tables:
--   assignments           — teacher-created tasks for a class+section.
--   assignment_submissions — one row per student per assignment (upsert-safe).
--
-- Design decisions:
--   max_marks is nullable — some assignments are not graded.
--   section_id is nullable on assignments — null = whole class.
--   SubmissionStatus:  PENDING (not yet submitted) | SUBMITTED | LATE | GRADED.
--   marks_obtained is nullable until the teacher grades.
--   UNIQUE (assignment_id, student_id) prevents duplicate submissions.
--   Tenant isolation at service layer via Hibernate @Filter.

CREATE TABLE IF NOT EXISTS assignments (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID         NOT NULL REFERENCES tenants(id),
    school_id        UUID         NOT NULL REFERENCES schools(id),
    academic_year_id UUID         NOT NULL REFERENCES academic_years(id),
    class_id         UUID         NOT NULL REFERENCES classes(id),
    section_id       UUID         REFERENCES sections(id),
    subject_id       UUID         NOT NULL REFERENCES subjects(id),
    assigned_by      UUID         REFERENCES staff(id),
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    due_date         DATE         NOT NULL,
    max_marks        NUMERIC(8,2),
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                         CHECK (status IN ('DRAFT','PUBLISHED','CLOSED')),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_tenant       ON assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school_year  ON assignments(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_sec    ON assignments(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date     ON assignments(due_date);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id),
    assignment_id   UUID         NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id      UUID         NOT NULL REFERENCES students(id),
    school_id       UUID         NOT NULL REFERENCES schools(id),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','SUBMITTED','LATE','GRADED')),
    text_response   TEXT,
    submitted_at    TIMESTAMPTZ,
    marks_obtained  NUMERIC(8,2),
    feedback        TEXT,
    graded_by       UUID         REFERENCES staff(id),
    graded_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT assignment_submissions_unique UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_tenant     ON assignment_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student    ON assignment_submissions(student_id);
