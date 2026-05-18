-- TASK-010: Upload audit log
-- Immutable ledger of file upload, download-URL generation, and delete events.
-- No FK on document_id intentionally: deleted documents must not erase their audit trail.
-- No tenant Hibernate filter: audit records are readable across tenants for security reviews.

CREATE TABLE upload_audit_log (
    id             UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id      UUID         NOT NULL,
    school_id      UUID         NOT NULL,
    actor_id       UUID         NOT NULL,
    event          VARCHAR(30)  NOT NULL,   -- UPLOAD | DOWNLOAD_URL | DELETE
    document_id    UUID,                    -- NULL only on pre-save failures; set after successful persist
    object_key     VARCHAR(512) NOT NULL,
    file_name      VARCHAR(255),
    mime_type      VARCHAR(120),
    size_bytes     BIGINT,
    correlation_id VARCHAR(64),
    occurred_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Primary query: per-tenant audit trail ordered newest-first
CREATE INDEX idx_upload_audit_tenant_occurred
    ON upload_audit_log (tenant_id, occurred_at DESC);

-- Secondary query: all events for a specific document
CREATE INDEX idx_upload_audit_document
    ON upload_audit_log (document_id)
    WHERE document_id IS NOT NULL;
