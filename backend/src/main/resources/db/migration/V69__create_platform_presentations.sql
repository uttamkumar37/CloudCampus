-- DSEP Phase 1: Presentation Builder
-- Slide decks targeted at specific stakeholder audiences.

CREATE TABLE platform_presentations (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(120) UNIQUE NOT NULL,
    audience_type VARCHAR(40)  NOT NULL CHECK (audience_type IN ('INVESTOR','SCHOOL_OWNER','SCHOOL_ADMIN','PARENT','GENERAL')),
    status        VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    meta_json     JSONB        NOT NULL DEFAULT '{}',
    branding_json JSONB        NOT NULL DEFAULT '{}',
    created_by    UUID         REFERENCES users(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_presentation_slides (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID        NOT NULL REFERENCES platform_presentations(id) ON DELETE CASCADE,
    position        INTEGER     NOT NULL,
    slide_type      VARCHAR(40) NOT NULL CHECK (slide_type IN ('TITLE','METRICS','COMPARISON','TIMELINE','QUOTE','MEDIA','CTA','CHART','FAQ')),
    content_json    JSONB       NOT NULL DEFAULT '{}',
    animation_json  JSONB       NOT NULL DEFAULT '{}',
    speaker_notes   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (presentation_id, position)
);

CREATE INDEX idx_pp_status   ON platform_presentations (status, audience_type);
CREATE INDEX idx_pps_pres_id ON platform_presentation_slides (presentation_id, position);
