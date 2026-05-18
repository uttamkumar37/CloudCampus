-- DSEP Phase 6: Experience Studio foundations
-- Branding systems, website routes, and stakeholder journeys managed by Super Admin.

CREATE TABLE platform_brand_systems (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(160) NOT NULL,
    code             VARCHAR(80)  NOT NULL UNIQUE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    token_json       JSONB        NOT NULL DEFAULT '{}',
    typography_json  JSONB        NOT NULL DEFAULT '{}',
    motion_json      JSONB        NOT NULL DEFAULT '{}',
    version          INTEGER      NOT NULL DEFAULT 1,
    published        BOOLEAN      NOT NULL DEFAULT false,
    published_at     TIMESTAMPTZ,
    created_by       UUID         REFERENCES users(id),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pbs_status_updated ON platform_brand_systems (status, updated_at DESC);

CREATE TABLE platform_website_routes (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    route_path       VARCHAR(255) NOT NULL UNIQUE,
    audience_type    VARCHAR(50)  NOT NULL,
    title            VARCHAR(255) NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    seo_json         JSONB        NOT NULL DEFAULT '{}',
    layout_json      JSONB        NOT NULL DEFAULT '{}',
    cta_json         JSONB        NOT NULL DEFAULT '{}',
    published        BOOLEAN      NOT NULL DEFAULT false,
    published_at     TIMESTAMPTZ,
    created_by       UUID         REFERENCES users(id),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwr_audience_status ON platform_website_routes (audience_type, status, updated_at DESC);

CREATE TABLE platform_stakeholder_journeys (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    stakeholder_type VARCHAR(50)  NOT NULL,
    journey_key      VARCHAR(120) NOT NULL,
    name             VARCHAR(255) NOT NULL,
    conversion_goal  VARCHAR(255),
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    narrative_json   JSONB        NOT NULL DEFAULT '{}',
    touchpoints_json JSONB        NOT NULL DEFAULT '[]',
    published        BOOLEAN      NOT NULL DEFAULT false,
    published_at     TIMESTAMPTZ,
    created_by       UUID         REFERENCES users(id),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (stakeholder_type, journey_key)
);

CREATE INDEX idx_psj_stakeholder_status ON platform_stakeholder_journeys (stakeholder_type, status, updated_at DESC);
