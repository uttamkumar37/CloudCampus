-- CC-1201: Online class scheduling
-- Teachers schedule virtual class sessions with meeting links.
-- Students see upcoming sessions; school admin gets oversight.

CREATE TABLE online_classes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    section_id      UUID REFERENCES sections(id) ON DELETE SET NULL,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    meeting_url     VARCHAR(2000),
    platform        VARCHAR(30) NOT NULL DEFAULT 'CUSTOM',  -- ZOOM | GMEET | TEAMS | CUSTOM
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED | LIVE | ENDED | CANCELLED
    recording_url   VARCHAR(2000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT online_classes_platform_check CHECK (platform IN ('ZOOM','GMEET','TEAMS','CUSTOM')),
    CONSTRAINT online_classes_status_check   CHECK (status IN ('SCHEDULED','LIVE','ENDED','CANCELLED'))
);

CREATE INDEX idx_online_classes_tenant_id    ON online_classes(tenant_id);
CREATE INDEX idx_online_classes_staff_id     ON online_classes(staff_id);
CREATE INDEX idx_online_classes_scheduled_at ON online_classes(scheduled_at);
CREATE INDEX idx_online_classes_class        ON online_classes(class_id, section_id);
