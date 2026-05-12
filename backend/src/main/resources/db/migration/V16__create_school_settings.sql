-- V16: School Settings
-- One row per school; created automatically when a school is onboarded.
-- Stores all school-level operational configuration.
--
-- Columns:
--   timezone              — IANA tz identifier, e.g. "Asia/Kolkata"
--   locale                — BCP-47 locale code, e.g. "en-IN"
--   academic_calendar_type— How the year is divided (TERM/SEMESTER/TRIMESTER/QUARTER)
--   working_days_mask     — Bitmask 1–127: bit0=Sunday … bit6=Saturday
--                           Mon–Fri = 0b0111110 = 62 (most common)
--   grading_scheme        — How marks are reported (PERCENTAGE/GRADE_LETTER/GPA/CGPA)
--   min_attendance_pct    — Minimum attendance % required; used for eligibility checks
--   max_class_capacity    — Platform-wide default; may be overridden per section
--   allow_late_attendance — If TRUE, staff can mark attendance after cutoff
--   late_cutoff_minutes   — Minutes after class start considered "late"
--   school_logo_url       — CDN URL for the school's logo image
--   primary_color         — Hex colour for school-branded UI theme, e.g. "#1A73E8"

CREATE TABLE school_settings (
    school_id               UUID        NOT NULL,
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    timezone                VARCHAR(60)  NOT NULL DEFAULT 'UTC',
    locale                  VARCHAR(20)  NOT NULL DEFAULT 'en',
    academic_calendar_type  VARCHAR(20)  NOT NULL DEFAULT 'TERM',
    working_days_mask       SMALLINT    NOT NULL DEFAULT 62,        -- Mon–Fri
    grading_scheme          VARCHAR(20)  NOT NULL DEFAULT 'PERCENTAGE',
    min_attendance_pct      SMALLINT    NOT NULL DEFAULT 75,
    max_class_capacity      SMALLINT    NOT NULL DEFAULT 40,
    allow_late_attendance   BOOLEAN     NOT NULL DEFAULT FALSE,
    late_cutoff_minutes     SMALLINT    NOT NULL DEFAULT 15,
    school_logo_url         VARCHAR(500),
    primary_color           VARCHAR(7),                             -- e.g. "#1A73E8"
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_school_settings               PRIMARY KEY (school_id),
    CONSTRAINT fk_school_settings_school        FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT chk_school_settings_calendar     CHECK (academic_calendar_type IN ('TERM','SEMESTER','TRIMESTER','QUARTER')),
    CONSTRAINT chk_school_settings_grading      CHECK (grading_scheme IN ('PERCENTAGE','GRADE_LETTER','GPA','CGPA')),
    CONSTRAINT chk_school_settings_attendance   CHECK (min_attendance_pct BETWEEN 1 AND 100),
    CONSTRAINT chk_school_settings_capacity     CHECK (max_class_capacity BETWEEN 1 AND 500),
    CONSTRAINT chk_school_settings_cutoff       CHECK (late_cutoff_minutes BETWEEN 0 AND 120),
    CONSTRAINT chk_school_settings_days_mask    CHECK (working_days_mask BETWEEN 1 AND 127),
    CONSTRAINT chk_school_settings_color        CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_school_settings_tenant ON school_settings (tenant_id);
