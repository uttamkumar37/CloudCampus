-- CC-0505: Student document upload via MinIO
-- Each row tracks one file uploaded for a student (birth certificate, TC, passport, etc.)

CREATE TABLE IF NOT EXISTS student_documents (
    id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID        NOT NULL,
    school_id       UUID        NOT NULL,
    student_id      UUID        NOT NULL,
    document_type   VARCHAR(60) NOT NULL,   -- e.g. BIRTH_CERTIFICATE, TRANSFER_CERT
    file_name       VARCHAR(255) NOT NULL,  -- original filename shown to users
    mime_type       VARCHAR(120) NOT NULL,
    size_bytes      BIGINT      NOT NULL,
    object_key      VARCHAR(512) NOT NULL,  -- MinIO object key
    uploaded_by     UUID        NOT NULL,   -- user who uploaded
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_student_documents_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_docs_tenant      ON student_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_docs_student     ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_docs_school_type ON student_documents(school_id, document_type);
