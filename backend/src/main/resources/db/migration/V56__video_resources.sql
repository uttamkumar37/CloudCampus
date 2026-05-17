-- CC-1202: Video upload system
-- Teachers upload educational videos stored in MinIO.
-- Students stream them via pre-signed URLs.

CREATE TABLE video_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id        UUID REFERENCES staff(id) ON DELETE SET NULL,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    file_key        VARCHAR(1000) NOT NULL,  -- MinIO object key
    file_size_bytes BIGINT,
    content_type    VARCHAR(100) NOT NULL DEFAULT 'video/mp4',
    duration_seconds INT,
    thumbnail_key   VARCHAR(1000),           -- MinIO object key for thumbnail
    upload_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | READY | FAILED
    visibility      VARCHAR(20) NOT NULL DEFAULT 'CLASS',   -- CLASS | SCHOOL | PUBLIC
    view_count      BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT video_resources_upload_status_check CHECK (upload_status IN ('PENDING','READY','FAILED')),
    CONSTRAINT video_resources_visibility_check    CHECK (visibility IN ('CLASS','SCHOOL','PUBLIC'))
);

CREATE INDEX idx_video_resources_tenant_id  ON video_resources(tenant_id);
CREATE INDEX idx_video_resources_staff_id   ON video_resources(staff_id);
CREATE INDEX idx_video_resources_subject_id ON video_resources(subject_id);
CREATE INDEX idx_video_resources_class_id   ON video_resources(class_id);
