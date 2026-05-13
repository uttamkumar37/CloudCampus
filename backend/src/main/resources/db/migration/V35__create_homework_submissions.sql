-- Homework submissions by students (CC-0701)
CREATE TABLE homework_submissions (
    id          UUID PRIMARY KEY,
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    homework_id UUID        NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notes       TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at  TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT uq_homework_submission UNIQUE (homework_id, student_id)
);

CREATE INDEX idx_hw_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_hw_submissions_student  ON homework_submissions(student_id);
CREATE INDEX idx_hw_submissions_tenant   ON homework_submissions(tenant_id);
