-- E34: Staff Leave Management (CC-0604)
-- Single table tracks leave requests from any staff member.
-- leave_type is stored as a string enum (no separate lookup table needed for MVP).

CREATE TABLE leave_requests (
    id             UUID        NOT NULL PRIMARY KEY,
    tenant_id      UUID        NOT NULL,
    school_id      UUID        NOT NULL REFERENCES schools(id),
    staff_id       UUID        NOT NULL REFERENCES staff(id),
    leave_type     VARCHAR(20) NOT NULL,
    start_date     DATE        NOT NULL,
    end_date       DATE        NOT NULL,
    total_days     INT         NOT NULL,
    reason         TEXT        NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by    UUID,
    review_notes   TEXT,
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_leave_type   CHECK (leave_type IN ('SICK','CASUAL','EARNED','MATERNITY','PATERNITY','STUDY','UNPAID')),
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    CONSTRAINT chk_leave_dates  CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_school_status  ON leave_requests (school_id, status);
CREATE INDEX idx_leave_staff          ON leave_requests (staff_id);
CREATE INDEX idx_leave_dates          ON leave_requests (school_id, start_date, end_date);
