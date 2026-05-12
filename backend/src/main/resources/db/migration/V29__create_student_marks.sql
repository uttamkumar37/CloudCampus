-- V29: Student marks table — CC-1102 Marks entry system.
--
-- Design decisions:
--   One row per student per exam_subject (paper).
--   exam_id is denormalised from exam_subjects for efficient querying of all
--     marks for a student across an exam (result aggregation in E17).
--   marks_obtained is nullable: NULL means marks not yet entered;
--     is_absent = true means student was absent (marks_obtained stored as 0).
--   entered_by stores the staff UUID who last saved the entry (audit trail).
--   Tenant filter applied at service layer via Hibernate @Filter (tenant_id).
--   UNIQUE constraint on (exam_subject_id, student_id) — one entry per paper.

CREATE TABLE IF NOT EXISTS student_marks (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenants(id),
    exam_id             UUID            NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    exam_subject_id     UUID            NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    student_id          UUID            NOT NULL REFERENCES students(id),
    marks_obtained      NUMERIC(8, 2),
    is_absent           BOOLEAN         NOT NULL DEFAULT false,
    remarks             TEXT,
    entered_by          UUID,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT student_marks_unique        UNIQUE (exam_subject_id, student_id),
    CONSTRAINT student_marks_positive      CHECK  (marks_obtained IS NULL OR marks_obtained >= 0)
);

CREATE INDEX IF NOT EXISTS idx_student_marks_tenant       ON student_marks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_exam         ON student_marks(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_exam_subject ON student_marks(exam_subject_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_student      ON student_marks(student_id);
