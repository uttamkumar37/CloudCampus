-- ─────────────────────────────────────────────────────────────────────────────
-- V21 — Attendance Records
--
-- One row per student per attendance session.
-- Cascade-deleted when the parent session is deleted.
-- tenant_id is denormalized for efficient tenant-filtered queries.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE attendance_records (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id   UUID         NOT NULL,
    session_id  UUID         NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id  UUID         NOT NULL REFERENCES students(id)            ON DELETE CASCADE,
    status      VARCHAR(20)  NOT NULL,
    remarks     VARCHAR(300),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_att_record_status
        CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    CONSTRAINT uq_att_record_session_student
        UNIQUE (session_id, student_id)
);

-- Bulk session load (most common read path — load all records for a session)
CREATE INDEX idx_att_record_session  ON attendance_records(session_id);

-- Student attendance history (parent portal, student report card)
CREATE INDEX idx_att_record_student  ON attendance_records(student_id);

-- Status-based analytics (count ABSENT records for a school)
CREATE INDEX idx_att_record_status   ON attendance_records(status);

-- Tenant filter support
CREATE INDEX idx_att_record_tenant   ON attendance_records(tenant_id);
