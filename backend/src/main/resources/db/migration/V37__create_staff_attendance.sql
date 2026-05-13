-- E33: Staff Attendance System (CC-0603)
-- One record per staff member per date, unique per (school_id, staff_id, attendance_date).

CREATE TYPE staff_attendance_status AS ENUM (
    'PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'
);

CREATE TABLE staff_attendance (
    id              UUID        NOT NULL PRIMARY KEY,
    tenant_id       UUID        NOT NULL,
    school_id       UUID        NOT NULL REFERENCES schools(id),
    staff_id        UUID        NOT NULL REFERENCES staff(id),
    attendance_date DATE        NOT NULL,
    status          VARCHAR(20) NOT NULL,
    notes           TEXT,
    marked_by       UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_staff_attendance_day
        UNIQUE (school_id, staff_id, attendance_date),

    CONSTRAINT chk_staff_attendance_status
        CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'))
);

CREATE INDEX idx_staff_att_school_date ON staff_attendance (school_id, attendance_date);
CREATE INDEX idx_staff_att_staff       ON staff_attendance (staff_id);
CREATE INDEX idx_staff_att_tenant      ON staff_attendance (tenant_id);
