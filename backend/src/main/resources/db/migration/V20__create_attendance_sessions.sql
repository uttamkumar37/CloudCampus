-- ─────────────────────────────────────────────────────────────────────────────
-- V20 — Attendance Sessions
--
-- An attendance session represents one "taking" of attendance for a specific
-- class / section on a given date and period.
--
-- period_number:
--   0 = whole-day (or day-level) attendance
--   1-12 = specific class period (supports up to 12-period timetables)
--
-- session_date + class_id + section_id + period_number should be unique within
-- a school. Because section_id is nullable (whole-class attendance), the unique
-- guarantee is enforced at the service layer; an advisory unique index is added
-- for the common case (section-level attendance).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE attendance_sessions (
    id                UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id         UUID         NOT NULL REFERENCES tenants(id),
    school_id         UUID         NOT NULL REFERENCES schools(id),
    class_id          UUID         NOT NULL REFERENCES classes(id),
    section_id        UUID                  REFERENCES sections(id),
    academic_year_id  UUID         NOT NULL REFERENCES academic_years(id),
    subject_id        UUID                  REFERENCES subjects(id),
    taken_by_staff_id UUID                  REFERENCES staff(id) ON DELETE SET NULL,
    session_date      DATE         NOT NULL,
    period_number     SMALLINT     NOT NULL DEFAULT 0,
    is_finalized      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_att_session_period CHECK (period_number >= 0 AND period_number <= 12)
);

-- Most common query: all sessions for a school on a date (teacher dashboard)
CREATE INDEX idx_att_session_school_date   ON attendance_sessions(school_id, session_date);

-- Timetable / report drill-down by class
CREATE INDEX idx_att_session_class_date    ON attendance_sessions(class_id, session_date);

-- Section-level drill-down
CREATE INDEX idx_att_session_section_date  ON attendance_sessions(section_id, session_date)
    WHERE section_id IS NOT NULL;

-- Academic year scoped queries
CREATE INDEX idx_att_session_acad_year     ON attendance_sessions(academic_year_id, session_date);

-- Tenant filter support
CREATE INDEX idx_att_session_tenant        ON attendance_sessions(tenant_id);

-- Partial unique index: prevent duplicate sessions for section-level attendance
CREATE UNIQUE INDEX uidx_att_session_section
    ON attendance_sessions(school_id, class_id, section_id, session_date, period_number)
    WHERE section_id IS NOT NULL;

-- Partial unique index: prevent duplicate sessions for whole-class attendance
CREATE UNIQUE INDEX uidx_att_session_class_only
    ON attendance_sessions(school_id, class_id, session_date, period_number)
    WHERE section_id IS NULL;
