-- DSEP Phase 1: Platform Content Blocks
-- Global and per-tenant configurable content, versioned, publish-gated.
-- tenant_id=NULL means global (super-admin owned); per-tenant rows override global.

CREATE TABLE platform_content_blocks (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID        REFERENCES tenants(id) ON DELETE CASCADE,
    block_key    VARCHAR(120) NOT NULL,
    block_type   VARCHAR(40)  NOT NULL CHECK (block_type IN ('TEXT','HTML','NUMBER','JSON','MEDIA_REF')),
    content_json JSONB        NOT NULL DEFAULT '{}',
    locale       VARCHAR(10)  NOT NULL DEFAULT 'en',
    version      INTEGER      NOT NULL DEFAULT 1,
    published    BOOLEAN      NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_by   UUID         REFERENCES users(id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, block_key, locale, version)
);

CREATE INDEX idx_pcb_tenant_key ON platform_content_blocks (tenant_id, block_key, locale);
CREATE INDEX idx_pcb_published  ON platform_content_blocks (published, updated_at DESC);
CREATE INDEX idx_pcb_global_key ON platform_content_blocks (block_key, locale)
    WHERE tenant_id IS NULL;
