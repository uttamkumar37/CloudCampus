-- CC-1603: Tenant Knowledge Base
-- Tracks ingested documents. Raw vectors live in vector_store (V46).
-- Each document may be split into multiple chunks; chunk IDs are stored in
-- the vector_store metadata field "doc_id".

CREATE TABLE knowledge_documents (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID         NOT NULL REFERENCES tenants(id),
    title       VARCHAR(300) NOT NULL,
    source_type VARCHAR(50)  NOT NULL DEFAULT 'MANUAL',  -- MANUAL | URL
    char_count  INTEGER      NOT NULL DEFAULT 0,
    chunk_count INTEGER      NOT NULL DEFAULT 0,
    created_by  UUID         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_tenant    ON knowledge_documents (tenant_id);
CREATE INDEX idx_knowledge_created   ON knowledge_documents (tenant_id, created_at DESC);
