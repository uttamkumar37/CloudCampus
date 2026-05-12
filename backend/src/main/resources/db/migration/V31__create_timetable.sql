-- V31: Timetable slots — CC-0701 Timetable management.
--
-- Design decisions:
--   One row = one class period for a (class, section) on a given day of the week.
--   period_number : display order within the day (1–12).
--   start_time / end_time : optional — used for display / conflict detection only.
--   UNIQUE (school_id, academic_year_id, class_id, section_id, day_of_week, period_number)
--     prevents a section from being double-booked in the same period.
--   Teacher (staff) conflict is detected at the service layer via a separate query.
--   Tenant isolation applied at service layer via Hibernate @Filter (tenant_id).

CREATE TABLE IF NOT EXISTS timetable_slots (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID        NOT NULL REFERENCES tenants(id),
    school_id         UUID        NOT NULL REFERENCES schools(id),
    academic_year_id  UUID        NOT NULL REFERENCES academic_years(id),
    class_id          UUID        NOT NULL REFERENCES classes(id),
    section_id        UUID        NOT NULL REFERENCES sections(id),
    subject_id        UUID        NOT NULL REFERENCES subjects(id),
    staff_id          UUID        REFERENCES staff(id),
    day_of_week       VARCHAR(10) NOT NULL CHECK (day_of_week IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY')),
    period_number     SMALLINT    NOT NULL CHECK (period_number BETWEEN 1 AND 12),
    start_time        TIME,
    end_time          TIME,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT timetable_slots_unique_period
        UNIQUE (school_id, academic_year_id, class_id, section_id, day_of_week, period_number)
);

CREATE INDEX IF NOT EXISTS idx_timetable_tenant      ON timetable_slots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_timetable_school_year ON timetable_slots(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class_sec   ON timetable_slots(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_staff_day   ON timetable_slots(staff_id, day_of_week);
