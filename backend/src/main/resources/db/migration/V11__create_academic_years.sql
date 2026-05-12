-- V11: Academic years — defines the academic calendar for a school.
--
-- Design decisions:
--   One school can have multiple academic years over time (e.g. "2024-25", "2025-26").
--   Only ONE year per school may be marked is_current = TRUE at any time —
--   enforced by the partial unique index below.
--
--   status: ACTIVE | CLOSED | ARCHIVED
--     ACTIVE  — the year is in progress; attendance/fees can be recorded.
--     CLOSED  — year has ended; data is read-only.
--     ARCHIVED — year is hidden from regular views but data is retained.
--
--   Domain entities (Class, Student, Attendance, Fee) reference academic_year_id
--   so historical data stays intact when a new year begins.

CREATE TABLE IF NOT EXISTS academic_years (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id),
    school_id       UUID         NOT NULL REFERENCES schools(id),
    name            VARCHAR(100) NOT NULL,          -- e.g. "2025-26"
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    is_current      BOOLEAN      NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_academic_year_status  CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
    CONSTRAINT chk_academic_year_dates   CHECK (end_date > start_date)
);

-- List academic years for a school (most frequent query).
CREATE INDEX IF NOT EXISTS idx_academic_years_school  ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_tenant  ON academic_years(tenant_id);

-- Enforce at most one current year per school.
-- Partial unique index: only rows where is_current = TRUE are included.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_academic_years_current_school
    ON academic_years(school_id)
    WHERE is_current = TRUE;
