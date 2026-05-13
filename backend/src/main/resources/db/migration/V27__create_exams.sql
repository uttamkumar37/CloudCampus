-- V27 — Exams (CC-1101 Examination System)
CREATE TABLE exams (
    id              UUID         PRIMARY KEY,
    tenant_id       UUID         NOT NULL REFERENCES tenants(id),
    school_id       UUID         NOT NULL REFERENCES schools(id),
    academic_year_id UUID        NOT NULL REFERENCES academic_years(id),
    name            VARCHAR(200) NOT NULL,
    exam_type       VARCHAR(50)  NOT NULL,   -- UNIT_TEST | TERM | HALF_YEARLY | ANNUAL | MOCK | PRACTICAL
    status          VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',  -- DRAFT | SCHEDULED | ONGOING | COMPLETED | CANCELLED
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    total_marks     NUMERIC(8,2) NOT NULL DEFAULT 100,
    passing_marks   NUMERIC(8,2) NOT NULL DEFAULT 35,
    instructions    TEXT,
    created_by      UUID,                    -- staff_id
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT exams_dates_check CHECK (end_date >= start_date),
    CONSTRAINT exams_marks_check CHECK (passing_marks <= total_marks AND total_marks > 0 AND passing_marks >= 0)
);

CREATE INDEX idx_exams_tenant       ON exams(tenant_id);
CREATE INDEX idx_exams_school       ON exams(school_id);
CREATE INDEX idx_exams_academic_year ON exams(academic_year_id);
CREATE INDEX idx_exams_start_date   ON exams(start_date DESC);
CREATE INDEX idx_exams_status       ON exams(status);
