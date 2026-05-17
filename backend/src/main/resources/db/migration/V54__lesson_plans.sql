-- CC-0704: Lesson planning
-- Teachers create structured lesson plans per class/subject/date.

CREATE TABLE lesson_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    section_id      UUID REFERENCES sections(id) ON DELETE SET NULL,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    plan_date       DATE NOT NULL,
    period_number   INT,
    topic           VARCHAR(500) NOT NULL,
    objectives      TEXT,
    activities      TEXT,
    materials       TEXT,
    homework_note   TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT | PUBLISHED
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT lesson_plans_status_check CHECK (status IN ('DRAFT','PUBLISHED'))
);

CREATE INDEX idx_lesson_plans_tenant_id  ON lesson_plans(tenant_id);
CREATE INDEX idx_lesson_plans_staff_id   ON lesson_plans(staff_id);
CREATE INDEX idx_lesson_plans_date       ON lesson_plans(plan_date);
CREATE INDEX idx_lesson_plans_class      ON lesson_plans(class_id, section_id);
