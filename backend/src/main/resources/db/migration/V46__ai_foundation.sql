-- CC-1600/1601/1602: AI Gateway foundation — prompt registry, usage logs, vector store
-- Requires pgvector/pgvector:pg16 Docker image (not postgres:16-alpine).

CREATE EXTENSION IF NOT EXISTS vector;

-- Versioned, DB-backed prompt templates (CC-1601)
CREATE TABLE ai_prompt_templates (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key  VARCHAR(100) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    template    TEXT         NOT NULL,
    variables   TEXT,                          -- JSON array of expected variable names
    version     INTEGER      NOT NULL DEFAULT 1,
    is_active   BOOLEAN      NOT NULL DEFAULT false,
    created_by  UUID         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Enforce at most one active version per key
CREATE UNIQUE INDEX uq_prompt_key_active ON ai_prompt_templates (prompt_key) WHERE is_active = true;
CREATE INDEX idx_prompt_template_key    ON ai_prompt_templates (prompt_key);

-- AI call usage log — tokens, latency, cost (CC-1604)
CREATE TABLE ai_usage_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID        REFERENCES tenants(id),
    user_id       UUID,
    provider      VARCHAR(50)  NOT NULL,
    model         VARCHAR(100) NOT NULL,
    prompt_key    VARCHAR(100),
    input_tokens  INTEGER      NOT NULL DEFAULT 0,
    output_tokens INTEGER      NOT NULL DEFAULT 0,
    latency_ms    INTEGER,
    success       BOOLEAN      NOT NULL DEFAULT true,
    error_message TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_tenant  ON ai_usage_logs (tenant_id);
CREATE INDEX idx_ai_usage_created ON ai_usage_logs (created_at);

-- Vector store for embeddings — matches Spring AI PgVectorStore default schema (CC-1602)
CREATE TABLE vector_store (
    id        UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content   TEXT,
    metadata  JSONB,
    embedding vector(1536)
);

CREATE INDEX ON vector_store USING HNSW (embedding vector_cosine_ops);
CREATE INDEX idx_vector_metadata ON vector_store USING GIN (metadata);
