-- DSEP Phase 1: Analytics Event Store
-- Partitioned by quarter. IP is SHA-256 hashed — never raw (GDPR).

CREATE TABLE platform_experience_events (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    session_id   VARCHAR(128) NOT NULL,
    visitor_id   VARCHAR(128),
    tenant_id    UUID         REFERENCES tenants(id) ON DELETE SET NULL,
    event_type   VARCHAR(80)  NOT NULL,
    event_data   JSONB        NOT NULL DEFAULT '{}',
    page_path    VARCHAR(500),
    referrer     VARCHAR(500),
    utm_source   VARCHAR(120),
    utm_medium   VARCHAR(120),
    utm_campaign VARCHAR(120),
    device_type  VARCHAR(20),
    country_code VARCHAR(4),
    ip_hash      VARCHAR(64),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Initial partitions — add new ones each quarter via scheduled migration or cron
CREATE TABLE platform_experience_events_2026_q1
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE platform_experience_events_2026_q2
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE platform_experience_events_2026_q3
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE platform_experience_events_2026_q4
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE TABLE platform_experience_events_2027_q1
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2027-01-01') TO ('2027-04-01');

CREATE INDEX idx_pee_session  ON platform_experience_events (session_id, event_type);
CREATE INDEX idx_pee_visitor  ON platform_experience_events (visitor_id, created_at DESC);
CREATE INDEX idx_pee_tenant   ON platform_experience_events (tenant_id, event_type);
CREATE INDEX idx_pee_created  ON platform_experience_events (created_at DESC);
CREATE INDEX idx_pee_type     ON platform_experience_events (event_type, created_at DESC);
