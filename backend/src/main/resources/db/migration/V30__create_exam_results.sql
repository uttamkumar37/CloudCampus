-- V30: Exam results table — CC-1103 Result generation.
--
-- Design decisions:
--   One row per student per exam — stores aggregated totals after result
--   generation is triggered by the school admin.
--   total_marks_obtained = sum of marks_obtained across all papers (absent = 0).
--   total_marks_possible = sum of each exam_subject.total_marks for the exam.
--   percentage = (obtained / possible) * 100.
--   grade is computed by the service (A+/A/B/C/D/F).
--   rank is assigned by the service (1 = highest percentage), NULL before ranking.
--   is_passed = percentage >= exam-level pass threshold.
--   UNIQUE (exam_id, student_id) — re-generating overwrites via upsert.
--   Tenant filter applied at service layer via Hibernate @Filter (tenant_id).

CREATE TABLE IF NOT EXISTS exam_results (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL REFERENCES tenants(id),
    exam_id                 UUID            NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id              UUID            NOT NULL REFERENCES students(id),
    school_id               UUID            NOT NULL REFERENCES schools(id),
    total_marks_obtained    NUMERIC(10, 2)  NOT NULL DEFAULT 0,
    total_marks_possible    NUMERIC(10, 2)  NOT NULL,
    percentage              NUMERIC(5, 2)   NOT NULL DEFAULT 0,
    grade                   VARCHAR(5)      NOT NULL,
    rank                    INTEGER,
    is_passed               BOOLEAN         NOT NULL DEFAULT false,
    generated_at            TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT exam_results_unique UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_results_tenant     ON exam_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam       ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student    ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_rank       ON exam_results(exam_id, rank ASC NULLS LAST);
