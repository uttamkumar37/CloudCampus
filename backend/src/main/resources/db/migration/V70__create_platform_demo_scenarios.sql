-- DSEP Phase 2: Demo Orchestration
-- Self-serve interactive demo provisioning — each session gets an isolated ephemeral tenant.

CREATE TABLE platform_demo_scenarios (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(120) UNIQUE NOT NULL,
    description      TEXT,
    school_profile   JSONB        NOT NULL DEFAULT '{}',
    features_json    JSONB        NOT NULL DEFAULT '[]',
    data_seed_ref    VARCHAR(120),
    session_ttl_min  INTEGER      NOT NULL DEFAULT 30,
    display_order    INTEGER      NOT NULL DEFAULT 0,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_demo_sessions (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id   UUID         NOT NULL REFERENCES platform_demo_scenarios(id),
    visitor_token VARCHAR(128) UNIQUE NOT NULL,
    visitor_email VARCHAR(255),
    visitor_meta  JSONB        NOT NULL DEFAULT '{}',
    tenant_id     UUID         REFERENCES tenants(id),
    demo_username VARCHAR(255),
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','CLEANED_UP')),
    expires_at    TIMESTAMPTZ  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pds_token    ON platform_demo_sessions (visitor_token, status);
CREATE INDEX idx_pds_expires  ON platform_demo_sessions (expires_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_pds_scenario ON platform_demo_sessions (scenario_id, created_at DESC);
