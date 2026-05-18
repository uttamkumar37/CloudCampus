-- DSEP Phase 8: Expansion domains for complete Experience Studio coverage
-- Adds dedicated persistence for template marketplace, storytelling scenes, and trust modules.

CREATE TABLE platform_website_templates (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key          VARCHAR(120) NOT NULL UNIQUE,
    name                  VARCHAR(200) NOT NULL,
    category              VARCHAR(60)  NOT NULL,
    status                VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    preview_image_url     VARCHAR(500),
    tags_json             JSONB        NOT NULL DEFAULT '[]',
    schema_json           JSONB        NOT NULL DEFAULT '{}',
    default_branding_json JSONB        NOT NULL DEFAULT '{}',
    usage_count           BIGINT       NOT NULL DEFAULT 0,
    published             BOOLEAN      NOT NULL DEFAULT false,
    published_at          TIMESTAMPTZ,
    created_by            UUID         REFERENCES users(id),
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwt_category_status ON platform_website_templates (category, status, updated_at DESC);

CREATE TABLE platform_story_scenes (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_key         VARCHAR(120) NOT NULL UNIQUE,
    title             VARCHAR(255) NOT NULL,
    audience_type     VARCHAR(60)  NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    timeline_json     JSONB        NOT NULL DEFAULT '{}',
    proof_points_json JSONB        NOT NULL DEFAULT '[]',
    animation_json    JSONB        NOT NULL DEFAULT '{}',
    published         BOOLEAN      NOT NULL DEFAULT false,
    published_at      TIMESTAMPTZ,
    created_by        UUID         REFERENCES users(id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pss_audience_status ON platform_story_scenes (audience_type, status, updated_at DESC);

CREATE TABLE platform_trust_modules (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    module_key     VARCHAR(120) NOT NULL UNIQUE,
    title          VARCHAR(255) NOT NULL,
    category       VARCHAR(60)  NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    evidence_json  JSONB        NOT NULL DEFAULT '{}',
    metrics_json   JSONB        NOT NULL DEFAULT '{}',
    display_json   JSONB        NOT NULL DEFAULT '{}',
    published      BOOLEAN      NOT NULL DEFAULT false,
    published_at   TIMESTAMPTZ,
    created_by     UUID         REFERENCES users(id),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ptm_category_status ON platform_trust_modules (category, status, updated_at DESC);
